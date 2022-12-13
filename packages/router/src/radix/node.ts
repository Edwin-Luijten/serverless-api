import { MiddlewareHandler, RequestHandler } from '../types';

export enum NODE_TYPE {
    DEFAULT,
    PARAM,
    CATCHALL,
}

export class Node {
    type: number = NODE_TYPE.DEFAULT;
    path: string;
    fullPath: string;
    priority: number = 1;
    handler: RequestHandler | null = null;
    middlewares: MiddlewareHandler[] = [];

    children: Node[] = [];

    constructor(path: string = '', fullPath: string = '', handler?: RequestHandler) {
        this.path = path;
        this.fullPath = fullPath;
        this.handler = handler || null;
    }

    append(node: Node) {
        this.children.push(node);
        this.sort();
    }

    remove(node: Node) {
        const position = this.children.indexOf(node);

        if (position !== -1) this.children.splice(position, 1);
    }

    sort() {
        this.children.sort((a, b) => b.priority - a.priority);
    }
}