import { HiByeApi, SayHiCommandInput, SayByeCommandInput, SayHiCommandOutput, SayByeCommandOutput } from '@smithy-cdk/hi-bye-api-extensions'


export async function doTests(endpoint: string) {
    console.log(`Doing tests against ${endpoint}`);

    const client = new HiByeApi({
        endpoint,
    });

    // test the {baseUrl}/hi endpoint
    const hiRequestInput: SayHiCommandInput = {
        name: "Peaches"
    };

    const sayHiOutput: SayHiCommandOutput = await client.sayHi(hiRequestInput);
    console.log(sayHiOutput.greeting);


    // test the {baseUrl}/bye endpoint
    const byeRequestInput: SayByeCommandInput = {
        name: "James",
        salutation: "Dear Sir"
    };

    const sayByeOutput: SayByeCommandOutput = await client.sayBye(byeRequestInput);
    console.log(sayByeOutput.farewell);
}

// Uncomment to test locally
// doTests('[API ENDPOINT]');