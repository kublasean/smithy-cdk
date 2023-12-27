---
title: Get Started
layout: home
---
Note: See the project README for motivation for creating/using smithy-cdk

### Usage
(Install instruction go here when published)

*smithy-cdk-example-stack.ts*
```typescript
import * as cdk from 'aws-cdk-lib';
import * as node_lambda from 'aws-cdk-lib/aws-lambda-nodejs'
import * as lambda from 'aws-cdk-lib/aws-lambda'

import { SpecRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { SmithyApiDefinition, SmithyLambdaIntegration } from 'smithy-cdk';

import * as path from 'path'

export class SmithyCdkExampleStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Nodejs Lambda
        const sayHiLambda = new node_lambda.NodejsFunction(this, 'sayhi', {
            description: 'Greets the caller',
            runtime: lambda.Runtime.NODEJS_20_X
        });

        // Loads Smithy model into JSON from file
        const modelJson = buildSmithyModel({
            srcDir: path.join(__dirname, 'smithy'),
            modelName: 'HiByeApi'
        });

        // Create the API Gateway REST API
        new SpecRestApi(this, 'hiByeApi', {
            apiDefinition: new SmithyApiDefinition(modelJson, {
                'SayHiLambda': new SmithyLambdaIntegration(sayHiLambda, { allowTestInvoke: true })
            })
        });
    }
}
```

*hi-bye-api.smithy*
```smithy
@readonly
@http(method: "GET", uri: "/hi")
@integration(
    type: "aws_proxy",
    uri: "${SayHiLambda}",
    httpMethod: "POST"
)
operation SayHi {
    input: SayHiInput
    output: SayHiOutput
}
```

*HiByeApi.openapi.json*
```json
{
    /* ... */
    "x-amazon-apigateway-integration": {
        "type": "aws_proxy",
        "uri": {
            "Fn::Sub": "${SayByeLambda}"
        },
        "httpMethod": "POST"
    }
    /* ... */
}
```

*smithy-build.json*
```json
{
  "version": "1.0",
  "sources": ["models"],
  "maven": {
    "dependencies": [
      "software.amazon.smithy:smithy-openapi:1.41.1",
      "software.amazon.smithy:smithy-aws-traits:1.41.1",
      "software.amazon.smithy:smithy-aws-apigateway-openapi:1.42.0"
    ]
  },
  "projections": {
    "openapi-conversion": {
      "plugins": {
        "openapi": {
          "service": "smithycdk#HiByeApi",
          "protocol": "aws.protocols#restJson1",
          "version": "3.0.2", // <---- current latest OpenAPI version supported by API Gateway
          "apiGatewayDefaults": "2023-08-11",
          "disableCloudFormationSubstitution": false
        }
      }
    }
  }
}
```
