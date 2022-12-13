import { ParsedQs } from 'qs';
import { Request, Context, ParamsDictionary } from '@serverless_api/router';

export class InnerRequest implements Request {
    params: ParamsDictionary = {};
    query: ParsedQs = {};
    headers: { [key: string]: string | undefined } = {};
    body: any = {};
    path: string = '';
    method: string = 'GET';
    context: Context<any> = {};
    userAgent: string | undefined;
    cookies: { [key: string]: string } = {};
    ip: string | undefined;
    isBase64Encoded: boolean = false;
    clientCountry: string | undefined;

    getHeader(name: string): string | undefined {
        return undefined;
    }

    setHeader(name: string, value: string): this {
        return this;
    }

    hasHeader(name: string): boolean {
        return !!this.headers[name];
    }
}