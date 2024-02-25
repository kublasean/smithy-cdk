import { Handler } from 'aws-lambda';
import { doTests } from '../../sdk-test';

export const API_ENDPOINT_ENV = 'API_ENDPOINT';

export const handler: Handler = async (event, context) => {
    if (process.env[API_ENDPOINT_ENV] === undefined) {
        throw new Error(`SdkTest handler environment error, ${API_ENDPOINT_ENV} must be set`);
    }

    await doTests(process.env[API_ENDPOINT_ENV]);
    console.log('SDK Tests passed successfully');
}