import { Http2HandlerRuntimeExtension, HiByeApi, HiByeApiClientConfig, SayHiCommandInput } from '@smithy-cdk/hi-bye-api-extensions'


const config: any = {
    extensions: [
        new Http2HandlerRuntimeExtension(),
    ],
    endpoint: 'https://google.com',
}

const client = new HiByeApi(config);
const requestInput: SayHiCommandInput = {
    name: "Sean"
};

client.sayHi(requestInput)
    .then(output => {
        console.log(output);
    })
    .catch(error => {
        console.log(error);
    })
    .finally(() => {
        console.log('Done saying hi');
    });