import { InnerRequest, Request } from '@serverless_api/core';
import { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from 'aws-lambda';
import * as QS from 'querystring';

export function transformRequest(event: APIGatewayProxyEvent | APIGatewayProxyEventV2): Request {
    const req = new InnerRequest();

    req.method = 'httpMethod' in event ? event.httpMethod : 'requestContext' in event ? event.requestContext.http.method : 'GET';
    req.path = 'rawPath' in event ? event.rawPath : event.path;
    req.query = Object.assign({}, event.queryStringParameters);
    req.headers = Object.keys(event.headers).reduce((acc, header) => Object.assign(acc, {[header.toLowerCase()]: event.headers[header]}), {});
    req.userAgent = event.headers['user-agent']

    const cookies = 'cookies' in event ? event.cookies || [] : event.headers.cookie ? event.headers.cookie.split(';') : [];

    cookies.forEach((cookie) => {
        const _cookie = cookie.trim().split('=');
        req.cookies[_cookie[0]] = decodeURIComponent(_cookie[1]);
    });

    Object.keys(event.requestContext).forEach(key => {
        req.context[key] = event.requestContext[key];
    });

    req.ip = (req.headers['x-forwarded-for'] &&
        req.headers['x-forwarded-for'].split(',')[0].trim()) || (req.context['identity'] &&
        req.context['identity']['sourceIp'] &&
        req.context['identity']['sourceIp'].split(',')[0].trim());

    req.isBase64Encoded = event.isBase64Encoded;
    req.clientCountry = req.headers['cloudfront-viewer-country']
        ? req.headers['cloudfront-viewer-country'].toUpperCase()
        : 'unknown';

    const body = req.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString() : event.body;

    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
        req.body = QS.parse(body ?? '');
    } else if (typeof body === 'object') {
        // Do nothing
    } else {
        req.body = JSON.parse(body ?? '');
    }

    return req;
}
