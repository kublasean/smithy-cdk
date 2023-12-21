import * as apigw from "aws-cdk-lib/aws-apigateway";

import * as jp from 'jsonpath';
import { SmithyIntegration } from './smithy-integration';
import { SpecMethod } from "./smithy-method";
import { Construct } from "constructs";

export class SmithySubstitution {
    readonly uri?: string

    readonly credentials?: string

    readonly integration?: SmithyIntegration

    constructor(uri?: string, credentials?: string, integration?: SmithyIntegration) {
        if (!uri && !credentials && !integration) {
            throw Error("SmithySubstitution must have uri, credentials, or integration, all cannot be undefined");
        }

        if (integration && (uri || credentials)) {
            throw Error("Cannot have uri/credentials and integration");
        }

        this.uri = integration ? integration.uri : uri;
        this.credentials = credentials ? credentials : integration?.credentialsRole?.roleArn;
        this.integration = integration
    }

    static fromIntegration(integration: SmithyIntegration): SmithySubstitution {
        return new SmithySubstitution(undefined, undefined, integration);
    }
}

export class SmithyApiDefinition extends apigw.ApiDefinition {

    public bind(scope: Construct): apigw.ApiDefinitionConfig {

        const nodes = jp.nodes(this.definition, "$..['Fn::Sub']");
        for (const node of nodes) {
            console.log(node.value);

            if (node.path.length < 2) {
                throw Error("Fn::Sub is only supported for uri and credentials");
            }

            const parent = node.path[node.path.length - 2];
            const subKey = getSubstitutionKey(node.value);

            if (subKey in this.substitutions === false) {
                throw Error(`Unmatched substitution ${node.value}`);
            }

            const sub = this.substitutions[subKey];
            let newValue: string

            if (parent === "uri" && sub.uri) {
                console.log(`replacing uri ${node.value} with ${sub.uri}`);
                newValue = sub.uri;

                if (sub.integration && shouldCreatePermissions(this.definition, node.path)) {

                    if (scope instanceof apigw.SpecRestApi === false) {
                        throw Error("Can only bind ApiDefinition to SpecRestApi");
                    }
                    const api = scope as apigw.SpecRestApi;

                    sub.integration.bindToSpecMethod(SpecMethod.fromJsonPath(api, node.path));
                }

            } else if (parent == "credentials") {
                if (!sub.credentials) {
                    throw Error(`Unmatched credentials substitution: ${node.value}`);
                }

                console.log(`replacing credentials ${node.value} with ${sub.credentials}`);
                newValue = sub.credentials;

            } else {
                throw Error("Fn::Sub is currently only supported for uri and credentials");
            }

            node.path.pop();
            jp.value(this.definition, jp.stringify(node.path), newValue);
        }

        return {
            inlineDefinition: this.definition
        }
    }

    constructor(private definition: any, private substitutions: { [key: string]: SmithySubstitution }) {
        super();
    }
}


// --- Utilities below ---


function getSubstitutionKey(wrappedSubKey: string) {
    if (wrappedSubKey.length < 4 ||
        wrappedSubKey[0] != '$' ||
        wrappedSubKey[1] != '{' ||
        wrappedSubKey[wrappedSubKey.length - 1] != '}') {
        throw Error("Values for Fn::Sub must be wrapped like ${KeyName}, where KeyName is the substitution key");
    }

    const subKey = wrappedSubKey.substring(2, wrappedSubKey.length - 1);
    //console.log(subKey);

    return subKey;
}

function shouldCreatePermissions(json: any, jsonPath: jp.PathComponent[]): boolean {
    console.log(jsonPath);

    const newPath = jsonPath.slice(0, -2);
    newPath.push('credentials');

    if (jp.value(json, jp.stringify(newPath))) {
        return false;
    }
    return true;
}
