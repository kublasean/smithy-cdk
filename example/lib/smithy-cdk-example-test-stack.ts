import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as triggers from 'aws-cdk-lib/triggers';
import { API_ENDPOINT_ENV } from './handlers/sdktest';
import { NodeLambdaHelperTest } from './node-lambda-helper';

export class SmithyCdkExampleTestStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: {api: string} & cdk.StackProps) {
        super(scope, id, props);

        const sdkTestLambda = new NodeLambdaHelperTest(this, 'sdktest', {
            description: `Tests HiByeAPI routes -${new Date()}`, // force update every deploy
            environment: {
                [API_ENDPOINT_ENV]: props.api
            },
            timeout: cdk.Duration.seconds(60),
        }).lambda;

        // Run tests on Lambda / API Gateway updates using Smithy generated client SDK
        new triggers.Trigger(this, 'TriggerHiByeApiTests', {
            handler: sdkTestLambda,
            invocationType: triggers.InvocationType.REQUEST_RESPONSE,
            executeOnHandlerChange: true
        });
    }
}
