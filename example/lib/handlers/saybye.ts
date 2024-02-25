import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda";
import { server as sdk } from '@smithy-cdk-example/sdk';
import { convertEvent, convertVersion1Response } from '@aws-smithy/server-apigateway';

const domainHandler = sdk.getSayByeHandler(async (input: sdk.SayByeInput) => {
    return {
        farewell: `Goodbye ${input.salutation} ${input.name}! -- from api lambda`
    }
});

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    
    const httpResponse = await domainHandler.handle(convertEvent(event), {});

    return convertVersion1Response(httpResponse);
};