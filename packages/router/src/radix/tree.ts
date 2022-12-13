import { Node, NODE_TYPE } from './node';
import { MiddlewareHandler, RequestHandler } from '../types';

export type Route = {
    path: string;
    handler?: RequestHandler;
    middlewares: MiddlewareHandler[];
    params: { [key: string]: any };
}

export class Tree {
    private root: Node | null = null;
    protected method: string;

    constructor(method: string) {
        this.method = method;
    }

    add(path: string, handler: RequestHandler, middlewares: MiddlewareHandler[]) {
        if (!path.startsWith('/')) throw new Error(`Path must begin with '/' in path ${path}`);

        if (!this.root) this.root = new Node('', '');

        const fullPath = path;
        let node = this.root;

        node.priority++;

        walk:
            while (node) {
                path = path.substring(node.path.length);

                if (path.length === 0) {
                    node.handler = handler;
                    return this;
                }

                if (node.children.length) {
                    for (let nodeIndex = 0; nodeIndex < node.children.length; nodeIndex += 1) {
                        const selectedNode = node.children[nodeIndex];

                        let pathCompareIndex;
                        for (pathCompareIndex = 0; pathCompareIndex < Math.min(selectedNode.path.length, path.length); pathCompareIndex++) {
                            if (path[pathCompareIndex] !== selectedNode.path[pathCompareIndex]) {
                                break
                            }
                        }

                        // further down the rabbit hole
                        if (pathCompareIndex >= selectedNode.path.length) {
                            node.children[nodeIndex].priority++
                            node.sort()

                            node = selectedNode
                            continue walk;
                            // we inject a new node, cause the new path is part of this one
                        } else if (pathCompareIndex >= path.length) {
                            let newChild = new Node(path, fullPath, handler)

                            selectedNode.path = selectedNode.path.replace(path, '')

                            node.remove(selectedNode)

                            newChild.priority = selectedNode.priority + 1
                            newChild.append(selectedNode)

                            node.append(newChild)

                            return this
                            // we match partly, generate a new edge
                        } else if (pathCompareIndex > 0) {
                            let newEdge = new Node(path.substring(0, pathCompareIndex), '')

                            selectedNode.path = selectedNode.path.substring(pathCompareIndex)

                            newEdge.priority = selectedNode.priority + 1

                            node.remove(selectedNode)
                            node.append(newEdge)

                            newEdge.append(selectedNode)

                            node = newEdge

                            continue walk
                        }
                    }
                }

                this.appendNode(node, path, fullPath, handler, middlewares);

                return this;
            }

        return this;
    }

    private appendNode(node: Node, path: string, fullPath: string, handler: RequestHandler, middlewares: MiddlewareHandler[] = []) {
        let offset = 0;

        let child = new Node();

        for (let idx = 0; idx < path.length; idx += 1) {
            const char = path[idx];

            if (char !== ':' && char !== '*') continue;

            if (char === ':') {
                if (node.children.length !== 0 && idx === 0) {
                    throw new Error('Param node can not be appended to an already existing path')
                }

                if (offset < idx - offset) {
                    child.path = path.substring(offset, idx - offset);
                    offset = idx;
                    node.append(child);
                    node = child;
                }

                child = new Node();
                child.type = NODE_TYPE.PARAM;
            } else if (char === '*') {
                if (node.children.length !== 0 && idx === 0) {
                    throw new Error('Param node can not be appended to an already existing path')
                }

                if (offset < idx - offset) {
                    child.path = path.substring(offset, idx - offset)

                    offset = idx;
                    node.append(child);
                    node = child;
                }

                child = new Node();
                child.type = NODE_TYPE.CATCHALL;
            }
        }

        child.path = path.substring(offset);
        child.fullPath = fullPath;
        child.handler = handler;
        child.middlewares = middlewares;

        node.append(child)

        return this
    }

    get(path: string): Route | null {
        let node = this.root;

        if (!node) return null;

        let offset = node.path.length;
        let params = {};
        let pathLength = path.length;

        walk:
            while (node) {
                if (pathLength === offset) {
                    let route: Route = {
                        path: node.fullPath,
                        params: {},
                        middlewares: node.middlewares,
                    }

                    if (node.handler) route.handler = node.handler;

                    if (params) route.params = params;

                    return route;
                }

                if (!node.children.length) {
                    break;
                }

                for (let idx = 0; idx < node.children.length; idx += 1) {
                    const child: Node = node.children[idx];

                    if (child.type === NODE_TYPE.DEFAULT) {
                        if (path[offset] === child.path[0] && path.indexOf(child.path, offset) === offset) {
                            node = child;
                            offset += node.path.length;

                            continue walk;
                        }
                    } else if (child.type === NODE_TYPE.PARAM) {
                        let paramEnd = path.indexOf('/', offset);

                        paramEnd = paramEnd !== -1 ? paramEnd : pathLength;

                        params[child.path.substring(1)] = path.substring(offset, offset + (paramEnd - offset));

                        offset = paramEnd;
                        node = child;

                        continue walk;
                    }
                }

                break;
            }

        return null;
    }
}