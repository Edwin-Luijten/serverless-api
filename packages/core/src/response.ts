import { JsonValue, Response, CorsOptions, Request } from '@serverless_api/router';
import HttpStatusCode from './status-code';
import * as crypto from 'crypto';

export type ResponseTransformer = (response: InnerResponse, body: string) => Response;

export class InnerResponse implements Response {
    private request: Request;
    headers: { [key: string]: string | undefined } = {};
    isBase64Encoded: boolean = false;
    _etag: boolean = false;
    statusCode: number = HttpStatusCode.OK;
    _response: any;
    body: any;

    private readonly cb: ((err: any, res: any, response: Response) => void) | undefined;

    constructor(request: Request, private transform: ResponseTransformer, cb?: (err: any, res: any, response: Response) => void) {
        this.request = request;
        this.cb = cb;
    }

    status(code: number): this {
        this.statusCode = code;
        return this;
    }

    getHeader(name: string): string | undefined {
        return this.headers[name.toLowerCase()];
    }

    setHeader(name: string, value: string): this {
        this.headers[name.toLowerCase()] = value;
        return this;
    }

    getHeaders(): { [key: string]: string | undefined } {
        return this.headers;
    }

    removeHeader(name: string): this {
        delete this.headers[name.toLowerCase()];
        return this;
    }

    hasHeader(name: string): boolean {
        return !!this.headers[name];
    }

    json(body: JsonValue): void {
        this.setHeader('content-type', 'application/json').send(JSON.stringify(body));
    }

    sendStatus(code: number): void {
        this.status(code).send('');
    }

    cors(options: CorsOptions): this {
        const acao = this.getHeader('Access-Control-Allow-Origin');
        const acam = this.getHeader('Access-Control-Allow-Methods');
        const acah = this.getHeader('Access-Control-Allow-Headers');

        this.setHeader('Access-Control-Allow-Origin', options.origin ? options.origin : acao ? acao : '*');
        this.setHeader('Access-Control-Allow-Methods', options.methods ? options.methods : acam ? acam : 'GET, PUT, POST, DELETE, OPTIONS');
        this.setHeader('Access-Control-Allow-Headers', options.headers ? options.headers : acah ? acah : 'Content-Type, Authorization, Content-Length, X-Requested-With');

        if (options.maxAge && !isNaN(options.maxAge)) this.setHeader('Access-Control-Max-Age', ((options.maxAge / 1000) | 0).toString());
        if (options.credentials) this.setHeader('Access-Control-Allow-Credentials', options.credentials.toString());
        if (options.exposeHeaders) this.setHeader('Access-Control-Expose-Headers', options.exposeHeaders);

        return this;
    }

    etag(enable: boolean = true): this {
        this._etag = enable;
        return this;
    }

    cache(maxAge: string | number | boolean, isPrivate: boolean = false): this {
        if (typeof maxAge === 'string') this.setHeader('Cache-Control', maxAge);
        else if (typeof maxAge === 'boolean' && !maxAge) this.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        else {
            this.setHeader('Cache-Control', `${isPrivate ? 'private, ' : ''}max-age=${Number(maxAge)}`);
            this.setHeader('Expires', new Date(Date.now() + Number(maxAge)).toUTCString())
        }

        return this;
    }

    modified(date: Date | boolean = true) {
        if (date instanceof Date) this.setHeader('Last-Modified', date.toUTCString());
        else this.setHeader('Last-Modified', (new Date()).toUTCString());

        return this;
    }

    send(body: string): void {
        if (this._etag && ['GET', 'HEAD'].includes(this.request.method) && !this.hasHeader('etag') && this.statusCode === HttpStatusCode.OK) {
            this.setHeader('etag', `"${this.generateEtag(body)}"`);
        }

        const ifNoneMatch = this.request.getHeader('if-none-match');
        if (ifNoneMatch && ifNoneMatch === this.getHeader('etag')) {
            this.status(HttpStatusCode.NOT_MODIFIED);
            body = '';
        }

        const res = this.transform(this, body);

        if (this.cb) this.cb(null, res._response, res);
    }

    private generateEtag(body: string) {
        return crypto
            .createHash('sha256')
            .update(this.encodeBody(body))
            .digest('hex')
            .substring(0, 32)
    }

    private encodeBody(body: any): string {
        return typeof body === 'object' ? JSON.stringify(body) : body && typeof body !== 'string' ? body.toString() : body ? body : '';
    }
}