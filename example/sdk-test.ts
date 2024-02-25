import { client as sdk } from '@smithy-cdk-example/sdk';

export async function doTests(endpoint: string) {
    console.log(`Doing tests against ${endpoint}`);

    const client = new sdk.HiByeApi({
        endpoint,
    });

    // test the {baseUrl}/hi endpoint
    const hiRequestInput: sdk.SayHiCommandInput = {
        name: "Peaches"
    };

    const sayHiOutput: sdk.SayHiCommandOutput = await client.sayHi(hiRequestInput);
    console.log(sayHiOutput.greeting);


    // test the {baseUrl}/bye endpoint
    const byeRequestInput: sdk.SayByeCommandInput = {
        name: "James",
        salutation: "Dear Sir"
    };

    const sayByeOutput: sdk.SayByeCommandOutput = await client.sayBye(byeRequestInput);
    console.log(sayByeOutput.farewell);
}

// Uncomment to test locally
doTests('https://he8024pta3.execute-api.us-east-2.amazonaws.com/prod');