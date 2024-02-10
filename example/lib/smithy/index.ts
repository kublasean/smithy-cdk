import { RuntimeExtension, HiByeApiExtensionConfiguration } from "@smithy-cdk/hi-bye-api-client/src";
import { NodeHttp2Handler } from "@smithy/node-http-handler";

export * from "@smithy-cdk/hi-bye-api-client/src";

export class Http2HandlerRuntimeExtension implements RuntimeExtension {
    configure(extensionConfiguration: HiByeApiExtensionConfiguration): void {
        console.log("Enabling HTTP/2");
        extensionConfiguration.setHttpHandler(new NodeHttp2Handler());
    }
}

