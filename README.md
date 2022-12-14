# Serverless Api

This library tries to create a single developer experience between AWS Lambda and Google Cloud Functions.

## Installation

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

const api = createApi({
    version: '1.0.0',
    base: 'api/',
});

// url: api
api.get('/', (req: Request, res: Response) => res.sendStatus(200));

// url: api/articles/hello-world
api.get('/articles/:slug', (req: Request<slug: string>, res: Response) => {
    const {slug} = req.params;

    return res.json({slug});
});

export const handle = async (event: APIGatewayEvent, context: Context) => await api.run(event, context);
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
api.get('/articles/:slug', (req: Request<slug: string>, res: Response) => {
    const {slug} = req.params;

    return res.json({slug});
});

export const handle = async (req: Request, res: Response) => await api.run(res, req);
```