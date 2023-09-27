---
sidebar_position: 2
---

# The info module

One of the most powerful `rster` features is our `info` module. It allows you to directly define information about your api while declaring your routes. This information can be used to generate documentation, to validate requests and responses, to generate client libraries, and more. The `info` module can also directly add a info endpoint to your api that can be used to retrieve information about your api at runtime.

## Installation

The `info` module is included in the `rster` package, so you don't need to install anything extra to use it. If you don't use the `rster` package, it may be required to install the `@rster/info` package.

```bash
npm install @rster/info
```

...or with yarn:

```bash
yarn add @rster/info
```

You have to import the `@rster/info` package, but it normally has no exports you are interested in.

**If you are using the `rster` package, you don't need to import anything, everything is already included in the `rster` package.**

```typescript
import { rest } from "@rster/basic";
import "@rster/info";
```

The info module will now have expanded your prototypes and it's functions will be available.

## Usage

There are quite a few things you can tell the info module about your api. For that it provides a few utility functions.

### Declaring your api

#### Route Description

It may be useful to add a description to your routes. This description can be used to generate documentation, to validate requests and responses, to generate client libraries, and more. The `description` function allows you to add a description to your routes. It can be called multiple times, the descriptions will be concatenated.

```typescript
const api = rest(function () {
  this.get("/hello", function () {
    this.description("This is a hello world route.");
    this.description("It returns a hello world message.");

    this.action(function (req, res) {
      res.status(200).json({ message: "Hello World!" }).end();
    });
  });
});
```

If you want to get the description of a route, you can use `description` method without any arguments.
It will return the description of the route.

```typescript
const api = rest(function () {
  this.get("/hello", function () {
    this.description("This is a hello world route.");
    this.description("It returns a hello world message.");

    this.description(); // ["This is a hello world route.", "It returns a hello world message."]

    this.action(function (req, res) {
      res.status(200).json({ message: "Hello World!" }).end();
    });
  });
});
```

#### Route Fields

It may be useful to add fields to your routes. (something like `version`, `author`, etc...). These fields can be used to generate documentation, to validate requests and responses, to generate client libraries, and more. The `field` function allows you to add fields to your routes. It receives the name of the field and the value of the field. It overwrites the value of the field if it already exists.

```typescript
const api = rest(function () {
  this.get("/hello", function () {
    this.field("version", "1.1.0");
    this.field("author", "John Doe");

    this.action(function (req, res) {
      res.status(200).json({ message: "Hello World!" }).end();
    });
  });
});
```

If you want to get the fields of a route, you can use `fields` method without any arguments.
If you want to get the value of one field, you can use `field` method with the name of the field as argument.

```typescript
const api = rest(function () {
  this.get("/hello", function () {
    this.field("version", "1.1.0");
    this.field("author", "John Doe");

    this.fields(); // { version: "1.1.0", author: "John Doe" }
    this.field("version"); // "1.1.0"

    this.action(function (req, res) {
      res.status(200).json({ message: "Hello World!" }).end();
    });
  });
});
```

#### Route Declaration

It may be useful to add a declaration to your routes. This declaration can be used to generate documentation, to validate requests and responses, to generate client libraries, and more. The `declaration` function allows you to add a declaration to your routes.

A declaration tells rster about the required parameters of a route (body parameters, url parameters, query parameters) as well as it's response body.
Data types are defined using the `@rster/types` api.

```typescript
const api = rest(function () {
  // ...

  this.get("/hello", function () {
    // ...

    this.declaration({
      name: "Hello",
      expectBody: {
        name: { type: string(), required: true },
      },

      // Params via expectParams
      // expectParams: {
      //   name: { type: string(), required: true },
      // },

      // Query via expectQuery
      // expectQuery: {
      //   name: { type: string(), required: true },
      // },

      returnBody: object({
        message: { type: string(), required: true },
      }),
    });

    this.action(function (req, res) {
      res
        .status(200)
        .json({ message: `Hello ${req.body.name}!` })
        .end();
    });
  });
});
```

### The info endpoint

The info module can also directly add a info endpoint to your api that can be used to retrieve information about your api at runtime. The info endpoint is a `GET` (It works with any method, but `GET` is preferred) endpoint at the `/info` path (or any path you prefer). It returns a json object with information about your api. Just use the useInfo() function in your api declaration.

```typescript
const api = rest(function () {
  this.useInfo();

  // or, if you want to change the path of the info endpoint
  this.useInfo({
    path: "/api-info",
  });
});
```
