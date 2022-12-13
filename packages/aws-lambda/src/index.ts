import { BaseApi, ApiOptions, ApiInterface, InnerResponse, Response } from '@serverless_api/core';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { transformRequest } from './request-transformer';
import { transformResponse } from './response-transformer';

export const createApi = (options: ApiOptions): Api => new Api(options);

export class Api extends BaseApi implements ApiInterface {
    constructor(options: ApiOptions) {
        super(options);
    }

    public async run(event: APIGatewayProxyEvent, context: Context|null, cb?: (err: any, res: any, response: Response) => void): Promise<void> {
        const req = transformRequest(event);

        return super.handle(req, new InnerResponse(req, transformResponse, cb));
    }
}