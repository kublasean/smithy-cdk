import * as cdk from 'aws-cdk-lib';
import * as node_lambda from 'aws-cdk-lib/aws-lambda-nodejs'
import * as lambda from 'aws-cdk-lib/aws-lambda'

import { SpecRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { SmithyApiDefinition, SmithyLambdaIntegration, SmithySubstitution } from 'smithy-cdk';

import * as fs from 'fs'
import * as path from 'path'

export class SmithyCdkExampleStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Say hi lambda
        const sayHiLambda = new node_lambda.NodejsFunction(this, 'sayhi', {
            description: 'Greets the caller',
            runtime: lambda.Runtime.NODEJS_20_X
        });
        const sayHiLambdaIntegration = new SmithyLambdaIntegration(sayHiLambda, {
            allowTestInvoke: true
        });

        // Say bye lambda
        const sayByeLambda = new node_lambda.NodejsFunction(this, 'saybye', {
            description: 'Bids farewell to the caller',
            runtime: lambda.Runtime.NODEJS_20_X
        });
        const sayByeLambdaIntegration = new SmithyLambdaIntegration(sayByeLambda, {
            allowTestInvoke: true
        });

        // Read in the Smithy generated OpenAPI spec
        const modelJson = JSON.parse(
            fs.readFileSync(path.join(__dirname, '..', 'smithy', 'build', 'smithy', 
                'openapi-conversion', 'openapi', 'RenderTest.openapi.json'), 'utf-8'));

        // Create the API Gateway REST API
        new SpecRestApi(this, 'hiByeApi', {
            apiDefinition: new SmithyApiDefinition(modelJson, {
                'SayHiLambda': SmithySubstitution.fromIntegration(sayHiLambdaIntegration),
                'SayByeLambda': SmithySubstitution.fromIntegration(sayByeLambdaIntegration)
            })
        });
    }
}
