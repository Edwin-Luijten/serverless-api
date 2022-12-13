import { Request, RequestHandler, Response } from '@serverless_api/router';

export interface MiddlewareHandler {
    (req: Request, res: Response): void | boolean;
}

export function applyMiddlewares(middlewares: MiddlewareHandler[], handler: RequestHandler): RequestHandler {
    return (req, res) => {
        for (const middleware of middlewares) {
            if (middleware(req, res) === false) break;
        }

        return handler(req, res);
    }
}