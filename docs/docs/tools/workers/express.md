---
sidebar_position: 1
---

# @rster/worker-express

This package is a worker implementation for rster. It allows you to run your rster application on an express webserver.

## Installation

```bash
npm install @rster/worker-express
```

_alternatively you can use `yarn`_

```bash
yarn add @rster/worker-express
```

## Usage

```typescript
import { rest } from "rster";
import express from "express";
import "@rster/worker-express";

const api = rest(function () {
  // ...
});

const app = express();

app.use(api.express());
```

If you want to use a custom path you can configure the express mixin like this:

```typescript
app.use(
  api.express({
    basePath: "/api",
  })
);
```

You can also configure whether the express mixin should handle 404 errors or not:

```typescript
app.use(
  api.express({
    send404: true,
  })
);
```
