import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    
    const name: string = event.queryStringParameters!['name']!;

    const salutation: string = event.queryStringParameters!['salutation']!;

    return {
        statusCode: 200,
        body: JSON.stringify({
            greeting: `Bye ${salutation} ${name}! -- from api lambda`
        })
    };
};