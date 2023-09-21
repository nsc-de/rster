---
sidebar_position: 3
---

# Rster Builder

Rster Builder is a tool that allows you to create a new Rster project in a much more convenient way. Instead of thinking about routing we will build the api like a normal class (or nested object structure) and Rster Builder will take care of the rest.

## Installation

To install Rster Builder you need to run the following command:

### Installing the package

#### Using npm

```bash
npm install @rster/builder
```

#### Using yarn

```bash
yarn add @rster/builder
```

### Importing the package in your project

To import the package in your project you need to add the following line at the top of your file:

```typescript
import { api, module, method } from "@rster/builder";
```

## Usage

Rster builder has 3 main functions to create your api:

- `api` - Creates a new api, this is the main wrapper for your api and normally you will only have one per project. An api can contain multiple `modules` and `methods`.

  The `api` function takes 4 arguments:

  - `name` - The name of the api, this will be used to generate the api class name.
  - `description` - The description of the api, this will be used to generate the api class description.
  - `modules` - An array of modules that will be added to the api.
  - `methods` - An array of methods that will be added to the api.

- `module` - Creates a new module, this is a wrapper for a group of `methods` that normally would be related to each other. For example if we have a `user` module we could have `methods` like `createUser`, `getUser`, `updateUser`, etc. A module can contain multiple `methods` and (sub)`modules`.

  The `module` function takes 4-6 arguments:

  - `name` - The name of the module, this will be used to generate the module class name.
  - `description` - The description of the module, this will be used to generate the module class description.
  - `modules` - An array of modules that will be added to the module.
  - `methods` - An array of methods that will be added to the module.
  - `httpPath` - The http path of the module, this will be used to generate the module http path. (Defaults to `/{name}`)
  - `httpMethod` - The http method of the module, this will be used to generate the module http method. (Defaults to `ANY`)

- `method` - Creates a new method. A method contains functionality, for example we could have a `createUser` method that creates a new user in the database.

  The `method` function takes 3-6 arguments:

  - `name` - The name of the method, this will be used to generate the method class name.
  - `description` - The description of the method, this will be used to generate the method class description.
  - `declaration` - The declaration of the methods parameters and return type.
  - `httpPath` - The http path of the method, this will be used to generate the method http path. (Defaults to `/{name}`)
  - `httpMethod` - The http method of the method, this will be used to generate the method http method. (Defaults to `ANY`)
  - `action` - The action of the method, this is the actual functionality of the method. (Defaults to a method that throws an error saying that the method is not implemented)

_We will continue writing this tutorial soon._

<!--
### Creating a new api

Lets just start with a simple example. We will create a new api that has a `user` module with a `createUser` method.

```typescript
const users = [];

const api = api(
  "MyApi",
  ["My api"],
  [
    module(
      "users",
      ["User module"],
      [],
      [
        method(
          "createUser",
          ["Creates a new user"],
          (name: string, age: number) => {
            users.push({ name, age });
          }
        ),
      ],
      "/users"
    ),
  ]
);
``` -->
