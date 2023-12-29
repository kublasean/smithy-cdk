import * as cdk from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { IConstruct } from "constructs";

import { format as formatUrl } from 'url';
import { ISpecMethod } from "./smithy-method";



/**
 * @beta
 */
export interface SmithyIntegrationProps {
    
    /**
     * uri of the integration
     */
    readonly uri?: string,

    /**
     * IAM Role that API Gateway should assume to use the integration
     */
    readonly credentialsRole?: iam.IRole,
}


/**
 * Base class for SmithyIntegrations, which bind a AWS resource to an API path from a Smithy spec. 
 * At least one of uri/credentialsRole must be defined
 * @beta
 */
export abstract class SmithyIntegration {

    readonly uri?: string

    readonly credentialsRole?: iam.IRole

    constructor(options: SmithyIntegrationProps) {
        this.credentialsRole = options.credentialsRole;
        this.uri = options.uri;

        if (!this.uri && !this.credentialsRole) {
            throw Error("Invalid SmithyIntegration, must have credentials or uri");
        }
    }

    
    /**
     * If applicable for the SmithyIntegration type, grants the provided API method 
     * permissions to use the integration
     *
     * @param method - REST API path
     */
    abstract bindToSpecMethod(method: ISpecMethod): void
}


/**
 * @beta
 */
export interface SmithyLambdaIntegrationProps {
    /**
     * IAM Role API Gateway should use to invoke the Lambda. If 
     * left undefined the integration will generated default permissions
     * when bound to an API path. 
     */
    readonly credentialsRole?: iam.IRole,

    /**
     * Only applicable when generating default permissions. Enable to 
     * also generate default permissions to allow API Gateway to invoke
     * the lambda while testing from the AWS console
     */
    readonly allowTestInvoke?: boolean
}

/**
 * @beta
 */
export class SmithyLambdaIntegration extends SmithyIntegration {

    private handler: lambda.IFunction

    private enableTest: boolean

    constructor(handler: lambda.IFunction, props?: SmithyLambdaIntegrationProps) {
        super({
            ...props,
            uri: getAwsUri(handler, {
                service: 'lambda',
                path: `2015-03-31/functions/${handler.functionArn}/invocations`
            })
        });
        this.handler = handler;
        this.enableTest = props?.allowTestInvoke ?? false;
    }

    
    /**
     * Create permissions for API Gateway to invoke the Lambda handler. If a 
     * credentialsRole is already supplied then no new permissions are created
     *
     * @param method - REST API path which should invoke this Lambda
     */
    bindToSpecMethod(method: ISpecMethod) {

        // If the user explicitly set the ARN of a role to use (that already exists), don't create any permissions
        if (this.credentialsRole) {
            return;
        }

        const principal = new iam.ServicePrincipal('apigateway.amazonaws.com');

        const desc = `${cdk.Names.nodeUniqueId(method.api.node)}.${method.httpMethod}.${method.resourcePath.replace(/\//g, '.')}`;

        this.handler.addPermission(`ApiPermission.${desc}`, {
            principal,
            scope: method.api,
            sourceArn: cdk.Lazy.string({ produce: () => method.methodArn }),
        });

        // add permission to invoke from the console
        if (this.enableTest) {
            this.handler.addPermission(`ApiPermission.Test.${desc}`, {
                principal,
                scope: method.api,
                sourceArn: cdk.Lazy.string({ produce: () => method.testMethodArn })
            });
        }
    }
}

// Utilities below

function parseAwsApiCall(path?: string, action?: string, actionParams?: { [key: string]: string }): { apiType: string, apiValue: string } {
    if (actionParams && !action) {
        throw new Error('"actionParams" requires that "action" will be set');
    }

    if (path && action) {
        throw new Error(`"path" and "action" are mutually exclusive (path="${path}", action="${action}")`);
    }

    if (path) {
        return {
            apiType: 'path',
            apiValue: path,
        };
    }

    if (action) {
        if (actionParams) {
            action += '&' + formatUrl({ query: actionParams }).slice(1);
        }

        return {
            apiType: 'action',
            apiValue: action,
        };
    }

    throw new Error('Either "path" or "action" are required');
}

function getAwsUri(scope: IConstruct, props: apigw.AwsIntegrationProps): string {
    const backend = props.subdomain ? `${props.subdomain}.${props.service}` : props.service;
    const { apiType, apiValue } = parseAwsApiCall(props.path, props.action, props.actionParameters);
    return cdk.Lazy.string({
        produce: () => {
            if (!scope) { throw new Error('AwsIntegration must be used in API'); }
            return cdk.Stack.of(scope).formatArn({
                service: 'apigateway',
                account: backend,
                resource: apiType,
                arnFormat: cdk.ArnFormat.SLASH_RESOURCE_NAME,
                resourceName: apiValue,
                region: props.region
            });
        },
    })
}