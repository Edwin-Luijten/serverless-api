<img src="logo.png" align="right" />

# Serverless Framework

> This library creates a single developer experience between AWS Lambda and Google Cloud Functions.


![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Google Cloud](https://img.shields.io/badge/GoogleCloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white)

## Contents

TBD

## Installation Options

### Boilerplate

`@serverless-framework/create` allows you to setup your serverless project quick and easy.
It comes with a project structure and basic handler to get you started.
Included tools:

- [Webpack](https://webpack.js.org/)
- [Serverless](https://www.serverless.com/framework/docs)
- [Typescript](https://www.typescriptlang.org/)

#### Usage
```shell
Usage: @serverless-framework/create <project-directory> <type> [OPTIONS]

Options:
  -h, --help  display help for command
    <project-directory> <type> are required.
    <type> aws-lambda or google-cloud-functions.
```
#### AWS Lambda

```shell
npx @serverless-framework/create my-serverless-api aws-lambda
```

#### Google Cloud Functions

```shell
npx @serverless-framework/create my-serverless-api google-cloud-functions
```

### Individual packages

If you already have a project setup, or want to do your own setup.

### AWS Lambda

```shell
npm install @serverless-framework/core @serverless-framework/aws-lambda
```

### Google Cloud Functions

```shell
npm install @serverless-framework/core @serverless-framework/google-cloud-functions
```

## Usage

### AWS Lambda

```typescript
import { Request, Response, HttpStatusCode } from '@serverless-framework/core';
import { createApi } from '@serverless-framework/aws-lambda';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

const api = createApi({
    base: '/api',
});

// url: api
api.get('/', (req: Request, res: Response) => res.sendStatus(HttpStatusCode.OK));

// url: api/articles/hello-world
api.get('/articles/:slug', (req: Request<{ slug: string }>, res: Response) => {
    const {slug} = req.params;

    return res.json({slug});
});

export const handle = async (event: APIGatewayProxyEvent, context: Context) => await api.run(event, context);
```

### Google Cloud Functions

```typescript
import { Request, Response, HttpStatusCode } from '@serverless-framework/core';
import { createApi } from '@serverless-framework/google-cloud-functions';

const api = createApi({
    base: '/api',
});

// url: api
api.get('/', (req: Request, res: Response) => res.sendStatus(HttpStatusCode.OK));

// url: api/articles/hello-world
api.get('/articles/:slug', (req: Request<{ slug: string }>, res: Response) => {
    const {slug} = req.params;

    return res.json({slug});
});

export const handle = async (req: Request, res: Response) => await api.run(res, req);
```

## Routing

---

### Stand-alone usage

#### Installation

The router is part of the core package, tough it can be used stand-alone as well.

```shell
npm install @serverless-framework/router
```

#### Usage

```typescript
import { Router, Request, Response } from '@serverless-framework/router';

const router = new Router({
    base: '/api',
});

// Setup routes
router.get('/users', (req: Request, res: Response) => {
    res.sendStatus(200);
});

// Get the path from your request and do a lookup
const route = router.lookup('GET', '/api/users/1');

// Handle the route
if (route) route.handle(req, res);
```

### Methods

### Groups

### Middlewares

#### Global

#### Per route

## To-do

- [ ] Documentation
- [ ] Core functionality
- [x] AWS Lambda support
- [ ] Google Cloud Functions support
- [ ] Azure support

## Contribution