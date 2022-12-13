import { Request, Response, RequestHandler, Router } from '@serverless_api/router';
import HttpStatusCode from './status-code';
import { applyMiddlewares, MiddlewareHandler } from './middleware';

export type ApiOptions = {
    base?: string;
}

export interface ApiInterface {
    run(...args: any[]): void;
}

export class BaseApi {
    private router: Router;
    private middlewares: MiddlewareHandler[] = [];

    constructor(options: ApiOptions) {
        this.router = new Router(options?.base ?? '/');
    }

    public use(...handler: MiddlewareHandler[]): this {
        this.middlewares = this.middlewares.concat(handler);

        return this;
    }

    public any(path: string, handler: RequestHandler, ...middlewares: MiddlewareHandler[]): this {
        this.router.any(path, handler, ...middlewares);

        return this;
    }

    public get(path: string, handler: RequestHandler, ...middlewares: MiddlewareHandler[]): this {
        this.router.get(path, handler, ...middlewares);

        return this;
    }

    public post(path: string, handler: RequestHandler, ...middlewares: MiddlewareHandler[]): this {
        this.router.post(path, handler, ...middlewares);

        return this;
    }

    public put(path: string, handler: RequestHandler, ...middlewares: MiddlewareHandler[]): this {
        this.router.put(path, handler, ...middlewares);

        return this;
    }

    public patch(path: string, handler: RequestHandler, ...middlewares: MiddlewareHandler[]): this {
        this.router.patch(path, handler, ...middlewares);

        return this;
    }

    public delete(path: string, handler: RequestHandler, ...middlewares: MiddlewareHandler[]): this {
        this.router.delete(path, handler, ...middlewares);

        return this;
    }

    public head(path: string, handler: RequestHandler, ...middlewares: MiddlewareHandler[]): this {
        this.router.head(path, handler, ...middlewares);

        return this;
    }

    public options(path: string, handler: RequestHandler, ...middlewares: MiddlewareHandler[]): this {
        this.router.options(path, handler, ...middlewares);

        return this;
    }

    public group(prefix: string, cb: (api: this) => void, ...middlewares: MiddlewareHandler[]) {
        this.router.applyPrefix(prefix);
        this.router.applyMiddlewares(middlewares);
        cb(this);
        this.router.removePrefix();
        this.router.clearAppliedMiddlewares();
    }

    public async handle(req: Request, res: Response): Promise<any> {
        const route = this.router.lookup(req.method, req.path);

        if (!route) {
            res.sendStatus(HttpStatusCode.NOT_FOUND);
            return res._response;
        }

        if (route.params) {
            req.params = route.params;
        }

        await new Promise<void>(async (resolve) => {
            try {
                let rtrn;
                if (route.handler) {
                    rtrn = await applyMiddlewares([...this.middlewares, ...route.middlewares], route.handler)(req, res);
                }

                if (rtrn) res.send(rtrn);
                resolve();
            } catch (e: any) {
                resolve();
            }
        });

        return res._response;
    }
}