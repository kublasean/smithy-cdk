#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SmithyCdkExampleStack } from '../lib/smithy-cdk-example-stack';

const app = new cdk.App();
new SmithyCdkExampleStack(app, 'SmithyCdkExampleStack');