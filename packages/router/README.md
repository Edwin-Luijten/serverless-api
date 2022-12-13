# Serverless Api Router  
This package is part of Serverless Api.  

---

The router implements its routing based on the concept of a [radix tree](https://en.wikipedia.org/wiki/Radix_tree) ([trie](https://en.wikipedia.org/wiki/Trie)).

## Contents

* [Installation](#installation)
* [Creating routes](#creating-routes)
* [Groups](#groups)
* [Middlewares](#middlewares)

## Installation

```shell
npm install @serverless_api/router
```

## Creating routes

```typescript
import { Router, Request, Response } from '@serverless_api/router';

const router = new Router();

router.get('/api/users', (req: Request, res: Response) => {
    res.sendStauts(200);
});

router.post('/api/users/:id', (req: Request, res: Response) => {
    res.status(200).json({
        id: req.params.id,
    });
});

router.put('/api/users/:id', (req: Request, res: Response) => {
    res.status(200).json({
        id: req.params.id,
    });
});

router.patch('/api/users/:id', (req: Request, res: Response) => {
    res.status(200).json({
        id: req.params.id,
    });
});

router.delete('/api/users/:id', (req: Request, res: Response) => {
    res.status(200).json({
        id: req.params.id,
    });
});

const route = router.lookup('GET', '/api/users/1');

if (route) route.handle(req, res);
```

## Groups

```typescript
import { Router, Request, Response } from '@serverless_api/router';

const router = new Router();

router.group('/api', (api) => {
    api.group('blog', (blog) => {
        blog.get('', (req: Request, res: Response) => {
            res.status(200).json([]);
        });

        blog.get(':slug', (req: Request, res: Response) => {
            res.status(200).json({
                slug: req.params.slug,
            });
        });
    });

    api.group('admin', (admin) => {
        admin.group('blog', (blogAdmin) => {
            blogAdmin.get('', (req: Request, res: Response) => {
                res.status(200).json([]);
            });

            blogAdmin.get(':id', (req: Request, res: Response) => {
                res.status(200).json({
                    id: req.params.id,
                });
            });
        });
    });
});
```

## Middlewares

```typescript
function authMiddleware(req: Request, res: Response) {
    // Returning false breaks the chain of middlewares
    if (!req.hasHeader('token')) {
        res.sendStatus(401);
        return false;
    }
}

function userMiddleware(req: Request, res: Response) {
    const token = req.getHeader('token');

    // token validation
    // ....
    const id = 'foo';

    if (id) {
        req.setHeader('user', id);
    }
}

// For a single route
router.get('/api/users/:id', (req: Request, res: Response) => {
    res.status(200).json({
        id: req.params.id,
    });
}, authMiddleware, userMiddleware);

// For groups
router.group('/api', (api) => {
    api.group('admin', (admin) => {
        admin.group('blog', (blogAdmin) => {
            blogAdmin.get('', (req: Request, res: Response) => {
                res.status(200).json([]);
            });

            blogAdmin.get(':id', (req: Request, res: Response) => {
                res.status(200).json({
                    id: req.params.id,
                });
            });
        });
    }, authMiddleware, userMiddleware);
});
```