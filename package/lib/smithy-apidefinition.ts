import * as apigw from "aws-cdk-lib/aws-apigateway";

import * as jp from 'jsonpath';
import { SpecMethod } from "./smithy-method";
import { Construct } from "constructs";
import { SmithyIntegration } from "./smithy-integration";


/**
 * Thin wrapper for a Smithy generated OpenAPI JSON spec file. Allows for injection of CDK references into 
 * certain sections of the file.
 * @beta
 */
export class SmithyApiDefinition extends apigw.ApiDefinition {

    
    /**
     * Binds the definition to a SpecRestAPI, substituting provided integrations into the spec JSON.
     * 
     * If an integration is found for a URI without having credentials already in the spec, then 
     * will defer to the integration to create a credentials role.
     *
     * @param scope - should ONLY be a SpecRestAPI, but jsii requires this type to be Construct
     */
    public bind(scope: Construct): apigw.ApiDefinitionConfig {

        const nodes = jp.nodes(this.definition, "$..['Fn::Sub']");
        for (const node of nodes) {
            console.debug(node.value);

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

            if (parent === "uri") {
                if (!sub.uri) {
                    throw Error(`Unmatched uri subsititution: ${node.value}`);
                }
                console.debug(`replacing uri ${node.value} with ${sub.uri}`);
                newValue = sub.uri;

                if (shouldCreatePermissions(this.definition, node.path)) {

                    // hahaha
                    const api = scope as apigw.SpecRestApi;

                    sub.bindToSpecMethod(SpecMethod.fromJsonPath(api, node.path));
                }

            } else if (parent == "credentials") {
                if (!sub.credentialsRole) {
                    throw Error(`Unmatched credentials substitution: ${node.value}`);
                }

                console.debug(`replacing credentials ${node.value} with ${sub.credentialsRole.roleArn}`);
                newValue = sub.credentialsRole.roleArn;

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

    
    /**
     * Creates an instance of SmithyApiDefinition. Where substitution keys are found in the definition,
     *  they will be replaced with the supplied integration
     *
     * @constructor
     * @param definition - OpenAPI JSON model
     * @param substitutions - list of substitution keys and integrations
     */
    constructor(private definition: unknown, private substitutions: { [key: string]: SmithyIntegration }) {
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
    return subKey;
}

function shouldCreatePermissions(json: unknown, jsonPath: jp.PathComponent[]): boolean {
    const newPath = jsonPath.slice(0, -2);
    newPath.push('credentials');

    if (jp.value(json, jp.stringify(newPath))) {
        return false;
    }
    return true;
}
