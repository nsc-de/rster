---
description: The current state of development of the project. (2023-09-14)
authors:
  - nsc-de
tags: [state-of-development]
hide_table_of_contents: false
---

# State of Development

Hello everyone,

in this article I would like to give you an overview of the current state of development of the project.

## What has happened so far?

In the last few weeks I have been working on the following things:

- The basic rster structure has been created. This includes the following packages
  - `@rster/common` - Contains a lot of base definitions for things like a `Request` or `Response`.
  - `@rster/util` - Contains our utility types for type definitions that are reused across the project.
  - `@rster/basic` - The basic rster api. This contains the basic stuff rster needs to work. All other packages are based on top of this package.
  - `@rster/types` - Contains all types for info about what the api wants to get from the user. Is not always needed, but quite a helpful utility.
  - `rster` - The main package. This contains all the other packages and is the main entry point for the user.
  - `@rster/worker-express` - The express worker - And our first worker implementation. This worker is based on express and is the default worker for rster. It is also the only worker that is currently available.
  - `@rster/ping` - A simple ping plugin. Using `api#usePing()` you can add a simple ping endpoint to your api. Included in the `rster` package itself.
  - `@rster/info` - A powerfull info plugin. Using `api#useInfo()` you can add a simple info endpoint to your api. Included in the `rster` package itself.
  - `@rster/info-client` - A client for the info plugin. This client can be used to get info about the api. So its a client-side plugin.

## What is planned for the future?

We are currently working on the following things:

- The `@rster/builder` package is heavily being worked on and will be released very soon. This package will contain a builder that can be used to build the api. This is a very powerfull addon on top of the basic apis rster provides as it includes automatic recogition for the types of input and output of the api. It automatically provides them to the info plugin (if enabled) and also can be used to generate functions to call on the server.
- The `@rster/database` will be main focus point after the release of `@rster/builder`. It will add on top of the powerful builder api to create a database connection and provide it to the api. It will work asynchroniously and will be able to be used with any database by providing a simple interface.
- The `@rster/authorization` package will be a package to handle authorization. We already have the main codebase for the package, but it is not yet ready to be released, as it is not yet fully tested and documented and we don't want to release a package relating to security that is not fully tested.
- The `@rster/generator` package will be able to generate a full package for a client from the definition `@rster/info` provides. This is a feature we are very excited about, as it will make it very easy to create a client for your api. No need to write any code, just run the generator and you are done.

Those are the immediate plans for the future. We are also working on a lot of other things, but those are the main things we are working on right now.

Have a nice day!
