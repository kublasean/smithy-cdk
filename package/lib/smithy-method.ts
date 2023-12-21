import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as jp from 'jsonpath'

export interface ISpecMethod {
    readonly api: apigw.SpecRestApi,
    readonly httpMethod: string,
    readonly resourcePath: string,

    get methodArn(): string
    get testMethodArn(): string
}

export class SpecMethod implements ISpecMethod {
    readonly api: apigw.SpecRestApi;
    readonly httpMethod: string;
    readonly resourcePath: string;

    constructor(api: apigw.SpecRestApi, httpMethod: string, resourcePath: string) {
        this.api = api
        this.httpMethod = httpMethod
        this.resourcePath = resourcePath
    }

    get methodArn(): string {
        const stage = this.api.deploymentStage?.stageName;
        return this.api.arnForExecuteApi(this.httpMethod, pathForArn(this.resourcePath), stage);
    }

    get testMethodArn(): string {
        return this.api.arnForExecuteApi(this.httpMethod, pathForArn(this.resourcePath), 'test-invoke-stage');
    }

    static fromJsonPath(api: apigw.SpecRestApi, jsonPath: jp.PathComponent[]): SpecMethod {
        const resource = jsonPath
            .map((val) => val.toString())
            .filter((strVal) => strVal.startsWith('/'))
            .join('');

        const method = jsonPath.at(-4)?.toString().toUpperCase()!; // haha trust me
        return new SpecMethod(api, method, resource);
    }
}

function pathForArn(path: string): string {
    return path.replace(/\{[^\}]*\}/g, '*'); // replace path parameters (like '{bookId}') with asterisk
}