import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from 'constructs';
import { existsSync } from "fs";
import path = require("path");

type NodeLambdaHelperProps = Omit<NodejsFunctionProps, "bundling" | "runtime">;

function getHandlerPath(id: string): string {
    const handlerPath = path.join(__dirname, 'handlers', id) + ".ts";

    if (!existsSync(handlerPath)) {
        throw new Error(`NodeLambdaHelper could not find file at ${handlerPath}`);
    }

    return handlerPath;
}

export class NodeLambdaHelperTest {
    readonly lambda: NodejsFunction;


    constructor(scope: Construct, id: string, props: NodeLambdaHelperProps) {
        this.lambda = new NodejsFunction(scope, id, {
            ...props,
            runtime: Runtime.NODEJS_20_X,
            bundling: {
                nodeModules: ["re2-wasm"],
            },
            entry: props.entry ?? getHandlerPath(id),
        });
    }
}