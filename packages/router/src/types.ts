import { ParsedQs } from 'qs';

export interface Dictionary<T> {
    [key: string]: T;
}

export interface ParamsDictionary {
    [key: string]: string;
}

export type Context<T> = T

export type ParamsArray = string[];
export type Params = ParamsDictionary | ParamsArray;

export type CorsOptions = {
    credentials?: boolean;
    exposeHeaders?: string;
    headers?: string;
    maxAge?: number;
    methods?: string;
    origin?: string;
};

export interface NextFunction {
    (err: any, res: any): void;
}

export interface MiddlewareHandler {
    (req: Request, res: Response): void | boolean;
}

export interface RequestHandler<P = any,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    Locals extends Record<string, any> = Record<string, any>> {
    (
        req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
        res: Response<ResBody, Locals>,
        next?: NextFunction,
    ): void | JsonValue;
}

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'TRACE' | 'ANY';

export interface Request<P = any,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    Ctx = any,
    Locals extends Record<string, any> = Record<string, any>> {
    params: P;
    path: string;
    method: string;
    query: ReqQuery;
    body: ReqBody;
    res?: Response<ResBody, Locals> | undefined;
    next?: NextFunction | undefined;
    context: Context<Ctx>;

    getHeader(name: string): string | undefined;

    setHeader(name: string, value: string): this;

    hasHeader(name: string): boolean;
}

export interface JsonMap {
    [member: string]: string | number | boolean | null | undefined | JsonArray | JsonMap
}

export interface JsonArray extends Array<string | number | boolean | null | undefined | JsonArray | JsonMap> {
}

export type JsonValue = JsonMap | JsonArray | string | number | boolean | null | undefined;

export type ErrorRequestHandler<P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    Locals extends Record<string, any> = Record<string, any>> = (
    err: any,
    req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
    res: Response<ResBody, Locals>,
    next: NextFunction,
) => void;

export interface Response<ResBody = any,
    Locals extends Record<string, any> = Record<string, any>,
    StatusCode extends number = number> {
    _response: any;

    status(code: StatusCode): this;

    getHeader(name: string): string | undefined;

    setHeader(name: string, value: string): this;

    getHeaders(): { [key: string]: string | undefined };

    removeHeader(name: string): this;

    json(body: JsonValue): void;

    send(body: string | JsonValue): void;

    sendStatus(code: StatusCode): void;

    cors(options: CorsOptions): this;

    etag(enable: boolean): this;

    cache(maxAge: number | boolean, isPrivate?: boolean): this;
}