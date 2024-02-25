import * as cdk from 'aws-cdk-lib';

import { SpecRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { SmithyApiDefinition, SmithyLambdaIntegration } from 'smithy-cdk';
import { NodeLambdaHelperTest } from './node-lambda-helper';

import * as fs from 'fs'
import * as path from 'path'
import { ExecSyncOptions, execSync } from 'node:child_process';

interface SmithyBuildOptions {
    readonly outDir?: string
    readonly srcDir: string
    readonly modelName: string
}

function buildSmithyModel(props: SmithyBuildOptions): any {

    const execOptions: ExecSyncOptions = { stdio: ['ignore', process.stderr, 'inherit'] };

    const outDir = props.outDir ?? path.join(props.srcDir, 'build', 'smithy');

    const modelPath = path.join(outDir, 'openapi-conversion', 'openapi', `${props.modelName}.openapi.json`);

    console.log(modelPath);

    if (!fs.existsSync(modelPath)) {

        const commands: string[] = [
            `smithy build --output ${outDir}`
        ]

        console.log(`building Smithy API in ${props.srcDir}...`);

        for (const command of commands) {
            execSync(command, {
                ...execOptions,
                cwd: props.srcDir
            });
        }
    } else {
        console.log('using pre-built Smithy model, build manually to update');
    }

    return JSON.parse(fs.readFileSync(modelPath, 'utf-8'));
}

export class SmithyCdkExampleStack extends cdk.Stack {
    readonly apiUrl: string;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Lambdas
        const sayHiLambda = new NodeLambdaHelperTest(this, 'sayhi', {
            description: 'Greets the caller',
        }).lambda;
        const sayByeLambda = new NodeLambdaHelperTest(this, 'saybye', {
            description: 'Bids farewell to the caller',
        }).lambda;

        const modelJson = buildSmithyModel({
            srcDir: path.join(__dirname, 'smithy'),
            modelName: 'HiByeApi'
        });

        // Create the API Gateway REST API
        const api = new SpecRestApi(this, 'hiByeApi', {
            apiDefinition: new SmithyApiDefinition(modelJson, {
                'SayHiLambda': new SmithyLambdaIntegration(sayHiLambda, { allowTestInvoke: true }),
                'SayByeLambda': new SmithyLambdaIntegration(sayByeLambda, { allowTestInvoke: true })
            })
        });

        this.apiUrl = api.url;
    }
}
