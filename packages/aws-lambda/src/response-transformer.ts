import { InnerResponse, Response } from '@serverless_api/core';

export function transformResponse(response: InnerResponse, body: any): Response {
    console.log('transform response');
    response._response = Object.assign(
        {},
        {
            headers: response.getHeaders(),
            statusCode: response.statusCode,
            body: body,
            isBase64Encoded: response.isBase64Encoded,
        },
    );

    return response;
}
