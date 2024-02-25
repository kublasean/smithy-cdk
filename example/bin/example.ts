#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SmithyCdkExampleStack } from '../lib/smithy-cdk-example-stack';
import { SmithyCdkExampleTestStack } from '../lib/smithy-cdk-example-test-stack';

const app = new cdk.App();

const apiStack = new SmithyCdkExampleStack(app, 'SmithyCdkExampleStack');

new SmithyCdkExampleTestStack(app, 'SmithyCdkExampleTestStack', {
    api: apiStack.apiUrl,
});