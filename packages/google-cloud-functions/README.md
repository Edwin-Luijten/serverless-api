# Serverless Api - Google Cloud Functions  
This package is part of Serverless Api.

---

## Installation

```shell
npm install @serverless_api/core @serverless_api/google-cloud-functions
```

## Usage

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
api.get('/articles/:slug', (req: Request<{slug: string}>, res: Response) => {
    const {slug} = req.params;

    return res.json({slug});
});

export const handle = async (req: Request, res: Response) => await api.run(res, req);
```