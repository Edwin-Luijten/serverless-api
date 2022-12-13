import { Request, Response, HttpStatusCode } from '@serverless_api/core';
import { createApi } from '@serverless_api/aws-lambda';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

const api = createApi({
    base: '/api',
});

api.get('/ping', (req: Request, res: Response) => res.status(HttpStatusCode.OK).send('pong'));

export const handle = async (event: APIGatewayProxyEvent, context: Context) => await api.run(event, context);