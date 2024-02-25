# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

## Non-NPM Required Dependencies
1. smithy-cli ^1.44.0
2. swagger-codegen ^3.0.54

## Timing
```bash
SmithyCdkExampleStack: deploying... [1/1]
SmithyCdkExampleStack: creating CloudFormation changeset...

 ✅  SmithyCdkExampleStack

✨  Deployment time: 48.44s

Outputs:
SmithyCdkExampleStack.hiByeApiEndpointEAE52533 = https://he8024pta3.execute-api.us-east-2.amazonaws.com/prod/
Stack ARN:
arn:aws:cloudformation:us-east-2:645177761882:stack/SmithyCdkExampleStack/01100a40-9fa6-11ee-9b66-02929ffa9649

✨  Total time: 53.61s
```
