import { Route, Tree } from './radix/tree';
import { Method, MiddlewareHandler, RequestHandler } from './types';

const METHOD_INDEX: { [key: string]: number } = {
    GET: 0,
    HEAD: 1,
    POST: 2,
    PUT: 3,
    PATCH: 4,
    DELETE: 5,
    CONNECT: 6,
    OPTIONS: 7,
    TRACE: 8,
    ANY: 9,
};

export class Router {
    // Tree per method
    private trees: Tree[] = [];
    private prefix: string = '';
    private middlewares: MiddlewareHandler[] = [];
    private registeredPaths: Map<string, string[]> = new Map();

    constructor(private base: string = '/') {
        if (!base.endsWith('/')) this.base = `${base}/`;
        this.base = this.base.replace(/([^:]\/)\/+/g, '$1'); // Remove double forward slashes

        // Create a tree for each method
        Object.values(METHOD_INDEX).forEach(index => this.trees[index] = new Tree(Object.keys(METHOD_INDEX)[index]));
    }

    public group(prefix: string, cb: (router: Router) => void, ...middlewares: MiddlewareHandler[]) {
        this.applyPrefix(prefix);
        this.applyMiddlewares(middlewares);

        cb(this);

        this.removePrefix();
        this.clearAppliedMiddlewares();
    }

    public applyPrefix(prefix: string): void {
        if (!prefix.endsWith('/')) prefix = `${prefix}/`;
        this.prefix = prefix;
    }

    public removePrefix(): void {
        this.prefix = '';
    }

    public applyMiddlewares(middlewares: MiddlewareHandler[]): void {
        this.middlewares = middlewares;
    }

    public clearAppliedMiddlewares(): void {
        this.middlewares = [];
    }

    any(path: string, handler: RequestHandler, ...middlewares: MiddlewareHandler[]): this {
        this.add('ANY', path, handler, ...middlewares);

        return this;
    }

    get(path: string, handler: RequestHandler, ...middlewares: MiddlewareHandler[]): this {
        this.add('GET', path, handler, ...middlewares);

        return this;
    }

    post(path: string, handler: RequestHandler, ...middlewares: MiddlewareHandler[]): this {
        this.add('POST', path, handler, ...middlewares);

        return this;
    }

    put(path: string, handler: RequestHandler, ...middlewares: MiddlewareHandler[]): this {
        this.add('PUT', path, handler, ...middlewares);

        return this;
    }

    patch(path: string, handler: RequestHandler, ...middlewares: MiddlewareHandler[]): this {
        this.add('PATCH', path, handler, ...middlewares);

        return this;
    }

    delete(path: string, handler: RequestHandler, ...middlewares: MiddlewareHandler[]): this {
        this.add('DELETE', path, handler, ...middlewares);

        return this;
    }

    head(path: string, handler: RequestHandler, ...middlewares: MiddlewareHandler[]): this {
        this.add('HEAD', path, handler, ...middlewares);
        return this;
    }

    options(path: string, handler: RequestHandler, ...middlewares: MiddlewareHandler[]) {
        this.add('OPTIONS', path, handler, ...middlewares);
    }

    lookup(method: string, path: string): Route | null {
        const methodIndex = this.methodIndexOf(method);
        if (methodIndex === -1) {
            return null;
        }

        let tree = this.trees[methodIndex];
        if (!tree) {
            // method not allowed
        }

        const metadata = tree.get(path);
        if (metadata) {
            return metadata;
        }

        tree = this.trees[this.methodIndexOf('ANY')];
        if (tree) return tree.get(path);

        return null;
    }

    public export(): Tree[] {
        return this.trees;
    }

    // add registers a new request handler with the given path and method
    private add(method: Method, path: string, handler: RequestHandler, ...middlewares: MiddlewareHandler[]) {
        // if (path.length < 1 || this.base[0] != '/') throw Error(`Path must begin with '/' in path '${this.base}'`);

        let registeredPaths: string[] = [];
        if (this.registeredPaths.has(method)) {
            registeredPaths = this.registeredPaths.get(method) || [];
        }

        registeredPaths.push(path);

        this.registeredPaths.set(method, registeredPaths);

        const methodIndex = this.methodIndexOf(method);

        let tree = this.trees[methodIndex];
        const fullPath = `${this.base}${this.prefix}${path}`.replace(/\/+$/, '');

        tree.add(fullPath, handler, this.middlewares.concat(middlewares));
    }

    private methodIndexOf(method: string): number {
        const _method = method.toUpperCase();
        if (typeof METHOD_INDEX[_method] === 'undefined') throw new Error(`Invalid method: ${_method}, must be one of: ${JSON.stringify(Object.keys(METHOD_INDEX).join(', '))}`);
        return METHOD_INDEX[_method];
    }
}