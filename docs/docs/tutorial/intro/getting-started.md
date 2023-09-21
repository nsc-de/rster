---
sidebar_position: 1
---

# Getting Started

Let's rster **rster in less than 5 minutes**.

## Let's get started with rster

### Prerequisites

We recommend you to have basic knowledge of the following tools before starting:

- [node.js](https://nodejs.org/en/): a JavaScript runtime built on Chrome's V8 JavaScript engine.
- [npm](https://www.npmjs.com/): a package manager for the JavaScript programming language.

### What you'll need

- [Node.js](https://nodejs.org/en/download/) version 14 or higher (which comes with [npm](http://npmjs.com/)) installed on your computer.
  - When installing Node.js, you are recommended to check all checkboxes related to dependencies.

## Installation

### Install rster package locally

```bash
npm install rster
```

_alternatively you can use `yarn`_

```bash
yarn add rster
```

### Additional Dependencies

`rster` packages a few core dependencies that will help you getting started. However we have a few more dependencies that you might want to install.
You definitly want to install a worker implementation. A worker implementation is a package that allows you to run your rster application on a webserver so you can access your api from the internet.
We recommend using [@rster/worker-express](https://www.npmjs.com/package/@rster/worker-express) as it is the easiest to get started with.

[find more worker implementations here](/docs/category/workers)

```bash
npm install @rster/worker-express
```

_alternatively you can use `yarn`_

```bash
yarn add @rster/worker-express
```

### Lets use express in our application

Firstly we want to import the rest function from rster as well as our worker's implementation. (we'll use express in this example)

```typescript
import rest from "rster";
import "@rster/worker-express";
```

The worker will extend the prototype of our rest api object. Types are automatically extended as well.

We will now add a simple ping endpoint. As ping endpoints are very common, we have a helper function for that.

```typescript
const api = rest(function () {
  this.usePing(); // Adds a ping endpoint to our api
});
```

Great. This time we want to add a custom endpoint. We will add a simple hello world endpoint.

```typescript
const api = rest(function () {
  this.get("/hello", function () {
    this.action(function (req, res) {
      res.status(200).json({ message: "Hello World!" }).end();
    });
  });
});
```

**NOTE:** It is important to use the `function()` syntax instead of the arrow function `() => {}` as the `this` keyword is not bound to the arrow function.

Now we can create a webserver using express and pass our api it using the `use` function and the `express` worker.

```typescript
import express from "express";

const app = express();

app.use(api.express());
```
