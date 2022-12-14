<img src="logo.png" align="right" />

# Serverless Framework

> This library creates a single developer experience between AWS Lambda and Google Cloud Functions.

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Google Cloud](https://img.shields.io/badge/GoogleCloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white)

## Contents

* [Installation Options](#installation-options)
    * [Boilerplate](#boilerplate)
        * [Usage](#boilerplate-usage)
        * [AWS Lambda](#boilerplate-aws-lambda)
        * [Google Cloud Functions](#boilerplate-google-cloud-functions)
    * [Individual packages](#individual-packages)
    * [AWS Lambda](#individual-packages-aws-lambda)
    * [Google Cloud Functions](#individual-packages-google-cloud-functions)
* [Usage](#usage)
    * [AWS Lambda](#usage-aws-lambda)
    * [Google Cloud Functions](#usage-google-cloud-functions)
* [Routing](#routing)
    * [Stand-alone usage](#stand-alone-usage)
        * [Installation](#installation)
        * [Usage](#routing-usage)
    * [Methods](#methods)
    * [Groups](#groups)
    * [Middlewares](#middlewares)
        * [Global](#global)
        * [Per route](#per-route)
        * [Per group](#per-group)
* [To-do](#to-do)
* [Contribution](#contribution)

## Installation Options

### Boilerplate

`@serverless-framework/create` allows you to setup your serverless project quick and easy.
It comes with a project structure and basic handler to get you started.

Included tools:

- [Webpack](https://webpack.js.org/)
- [Serverless](https://www.serverless.com/framework/docs)
- [Typescript](https://www.typescriptlang.org/)
  <a name="boilerplate-usage"></a>

#### Usage

```shell
Usage: @serverless-framework/create <project-directory> <type> [OPTIONS]

Options:
  -h, --help  display help for command
    <project-directory> <type> are required.
    <type> aws-lambda or google-cloud-functions.
```

<a name="boilerplate-aws-lambda"></a>

#### AWS Lambda

```shell
npx @serverless-framework/create my-serverless-api aws-lambda
```

<a name="boilerplate-google-cloud-functions"></a>

#### Google Cloud Functions

```shell
npx @serverless-framework/create my-serverless-api google-cloud-functions
```

### Individual packages

If you already have a project setup, or want to do your own setup.
<a name="individual-packages-aws-lambda"></a>

### AWS Lambda

```shell
npm install @serverless-framework/core @serverless-framework/aws-lambda
```

<a name="individual-packages-google-cloud-functions"></a>

### Google Cloud Functions

```shell
npm install @serverless-framework/core @serverless-framework/google-cloud-functions
```

## Usage

<a name="usage-aws-lambda"></a>

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

<a name="usage-google-cloud-functions"></a>

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

### Stand-alone usage

#### Installation

The router is part of the core package, tough it can be used stand-alone as well.

```shell
npm install @serverless-framework/router
```

<a name="routing-usage"></a>

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

#### Per group

## To-do

- [ ] Documentation
- [ ] Core functionality
- [x] AWS Lambda support
- [ ] Google Cloud Functions support
- [ ] Azure support

## Contribution