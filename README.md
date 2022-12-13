# Serverless Api
This library tries to create a single developer experience between AWS Lambda and Google Cloud Functions.  

---

## Contents

* [Installation](#installation)
  * [AWS Lambda](#aws-lambda)
  * [Google Cloud Functions](#google-cloud-functions)
* [Usage](#usage)
  * [AWS Lambda](#aws-lambda)
  * [Google Cloud Functions](#google-cloud-functions)
* [Routing](#routing)
  * [Methods](#methods)
  * [Groups](#groups)
  * [Middlewares](#middlewares)
    * [Global](#global)
    * [Per route](#per-route)

## Installation

### create-serverless-api

```shell
npm create @serverless_api/create-serverless-api my-serverless-api
```

### AWS Lambda

```shell
npm install @serverless_api/core @serverless_api/aws-lambda
```

### Google Cloud Functions

```shell
npm install @serverless_api/core @serverless_api/google-cloud-functions
```

## Usage

### AWS Lambda

```typescript
import { Request, Response } from '@serverless_api/core';
import { createApi } from '@serverless_api/aws-lambda';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

const api = createApi({
    version: '1.0.0',
    base: 'api/',
});

// url: api
api.get('/', (req: Request, res: Response) => res.sendStatus(200));

// url: api/articles/hello-world
api.get('/articles/:slug', (req: Request<{ slug: string }>, res: Response) => {
    const {slug} = req.params;

    return res.json({slug});
});

export const handle = async (event: APIGatewayProxyEvent, context: Context) => await api.run(event, context);
```

### Google Cloud Functions

```typescript
import { Request, Response } from '@serverless_api/core';
import { createApi } from '@serverless_api/google-cloud-functions';

const api = createApi({
    version: '1.0.0',
    base: 'api/',
});

// url: api
api.get('/', (req: Request, res: Response) => res.sendStatus(200));

// url: api/articles/hello-world
api.get('/articles/:slug', (req: Request<{ slug: string }>, res: Response) => {
    const {slug} = req.params;

    return res.json({slug});
});

export const handle = async (req: Request, res: Response) => await api.run(res, req);
```

## Routing

### Methods

All default methods are supported.

```typescript
router.get('/api/users', (req: Request, res: Response) => {});
router.post('/api/users/:id', (req: Request, res: Response) => {});
router.put('/api/users/:id', (req: Request, res: Response) => {});
router.patch('/api/users/:id', (req: Request, res: Response) => {});
router.delete('/api/users/:id', (req: Request, res: Response) => {});
router.head('/api/users/:id', (req: Request, res: Response) => {});
router.options('/api/users/:id', (req: Request, res: Response) => {});
```

### Groups

```typescript
const app = createApi({
    base: '/api'
});

app.group('articles', (api) => {
    api.get('', (req, res) => {});
    api.get(':slug', (req, res) => {});
});

// Generated routes:
// /api/articles
// /api/articles/foo-bar
```

### Middlewares

#### Global
```typescript

function authMiddleware(req: Request, res: Response) {
    // Returning false breaks the chain of middlewares
    if (!req.hasHeader('token')) return false;
}

function userMiddleware(req: Request, res: Response) {
    const token = req.getHeader('token');

    // token validation
    // ....
    const id = 1;
    
    if (id) {
        req.setHeader('user', id);
    }
}

app.use(authMiddleware, userMiddleware);
```

#### Per route
```typescript
function authMiddleware(req: Request, res: Response) {
    // Returning false breaks the chain of middlewares
    if (!req.hasHeader('token')) return false;
}

function userMiddleware(req: Request, res: Response) {
    const token = req.getHeader('token');

    // token validation
    // ....
    const id = 1;

    if (id) {
        req.setHeader('user', id);
    }
}

router.get('/api/users', (req: Request, res: Response) => {}, authMiddleware, userMiddleware);
```