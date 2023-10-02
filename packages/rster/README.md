<a name="readme-top"></a>

[![Github Shield][github-shield]][github-url]
[![NPM Shield][npm-shield]][npm-url]
[![Documentation][documentation-shield]][documentation-url]
[![TypeDoc][typedoc-shield]][typedoc-url]

[![Build Status][build-shield]][build-url]
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![BSD-3-Clause][license-shield]][license-url]
[![NPM][version-shield]][npm-url]
[![Downloads][downloads-shield]][npm-url]
[![Coverage][coverage-shield]][coverage-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/nsc-de/rster">
    <img src="https://raw.githubusercontent.com/nsc-de/rster/master/images/logo.png" alt="Logo" height="80" className="height-80px"/>
  </a>

<h3 align="center">rster</h3>

  <p align="center">
    <font color="red"><s>build</s></font> design your backend
    <br />
    <a href="https://nsc-de.github.io/rster/"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/nsc-de/rster">View Demo</a>
    ·
    <a href="https://github.com/nsc-de/rster/issues">Report Bug</a>
    ·
    <a href="https://github.com/nsc-de/rster/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#tutorial-intro">Tutorial Intro</a>
      <ol>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#what-youll-need">What you'll need</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#getting-started">Getting Started</a></li>
      </ol>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

Rster is built to simplify creation of restful backend apis. It is a framework that allows you to build your api in a modular way. It's core framework works quite similar to express, however we provide a few tools like `@rster/builder`, `@rster/database` to drastically simplify the creation of your api and directly integrate your database. These tools are especially powerful when combined with `typescript` as all typings are generated automatically.
Also with `@rster/generator` you can generate a typescript client directly from your server-side api definition which saves you a lot of time and nerves.

_**NOTE**: This project is still in early development and features are added frequently. If you have any suggestions or ideas feel free to open an issue or pull request. `@rster/generator` and `@rster/database` are not available via npm yet. They need to be built from source and are not yet documented or tested enough to be used in production. Feel free to try them out and give feedback. Please have some patience, they take a lot of work to build and test. They will be released soon. Thanks!_

<!-- [![Product Name Screen Shot][product-screenshot]](https://example.com) -->

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

[![typescript][typescript-shield]][typescript-url]
[![nodejs][nodejs-shield]][nodejs-url]
[![npm][npm-package-manager-shield]][npm-package-manager-url]
[![eslint][eslint-shield]][eslint-url]
[![jest][jest-shield]][jest-url]
[![turbo][turbo-shield]][turbo-url]
[![changesets][changesets-shield]][changesets-url]

- [typescript][typescript-url]
- [nodejs][nodejs-url]
- [npm][npm-package-manager-url]
- [eslint][eslint-url]
- [jest][jest-url]
- [turbo][turbo-url]
- [changesets][changesets-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Tutorial Intro

Hello and welcome to the rster project. Rster is the easiest way to build your backend api in nodejs. It is a framework that allows you to build your api in a modular way. Just define your library then use your functions to access and modify your data. Or directly add it to the express app using `express.use()`. It is up to you. You can even generate a typescript client directly from your server-side api definition!

Let's learn rster **rster in less than 5 minutes**.

## Prerequisites

We recommend you to have basic knowledge of the following tools before starting:

- [node.js](https://nodejs.org/en/): a JavaScript runtime built on Chrome's V8 JavaScript engine.
- [npm](https://www.npmjs.com/): a package manager for the JavaScript programming language.

## What you'll need

- [Node.js](https://nodejs.org/en/download/) version 14 or higher (which comes with [npm](http://npmjs.com/)) installed on your computer.
  - When installing Node.js, you are recommended to check all checkboxes related to dependencies.
  - On some systems you might need to install npm separately.

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

Rster packages a few core dependencies that will help you getting started. However we have a few more dependencies that you might want to install.
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

## Getting Started

### Lets use express in our application

Firstly we want to import the rest function from rster as well as our worker's implementation. (we'll use express in this example)

```typescript
import { rest } from "rster";
import "@rster/worker-express";
```

The worker will extend the prototype of our rest api object. Types are automatically extended as well.

Next we can define the pattern of our api. We will create a simple api that returns a string when we call the `/hello` endpoint.

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

_For more examples, please refer to the [Documentation][documentation-url]_

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

- [x] Rster base framework
- [ ] Rster advanced framework
  - [x] Rster builder _(in development, heavily worked on right now, will be released soon)_
  - [ ] Rster database _(in development)_
  - [ ] Rster generator _(in development)_

See the [open issues](https://github.com/nsc-de/rster/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the BSD-3-Clause License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Nicolas Schmidt &#60;[@nsc-de](https://github.com/nsc-de/)&#62;

[![twitter][contact-twitter-shield]][contact-twitter-url] [![github][contact-github-shield]][contact-github-url]

Project Link: [https://github.com/nsc-de/rster](https://github.com/nsc-de/rster)

[![GitHub][github-shield]][github-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

<!-- ## Acknowledgments

- []()
- []()
- []()

<p align="right">(<a href="#readme-top">back to top</a>)</p> -->

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

<!-- link shields -->

[github-shield]: https://img.shields.io/badge/github-grey?style=for-the-badge&logo=github
[github-url]: https://github.com/nsc-de/rster
[npm-shield]: https://img.shields.io/badge/npm-red?style=for-the-badge&logo=npm
[npm-url]: https://www.npmjs.com/package/rster
[typedoc-shield]: https://img.shields.io/badge/typedoc-darkblue?style=for-the-badge&logo=typescript
[typedoc-url]: https://nsc-de.github.io/rster/docs/api-reference
[documentation-shield]: https://img.shields.io/badge/documentation-blue.svg?style=for-the-badge&logo=github
[documentation-url]: https://nsc-de.github.io/rster/

<!-- Info Shields -->

[forks-shield]: https://img.shields.io/github/forks/nsc-de/rster.svg?style=for-the-badge
[forks-url]: https://github.com/nsc-de/rster/network/members
[stars-shield]: https://img.shields.io/github/stars/nsc-de/rster.svg?style=for-the-badge
[stars-url]: https://github.com/nsc-de/rster/stargazers
[issues-shield]: https://img.shields.io/github/issues/nsc-de/rster.svg?style=for-the-badge
[issues-url]: https://github.com/nsc-de/rster/issues
[license-shield]: https://img.shields.io/github/license/nsc-de/rster.svg?style=for-the-badge
[license-url]: https://github.com/nsc-de/rster/blob/master/LICENSE.txt
[build-shield]: https://img.shields.io/github/actions/workflow/status/nsc-de/rster/ci.yml?style=for-the-badge
[build-url]: https://github.com/nsc-de/rster/actions/workflows/ci.yml
[contributors-shield]: https://img.shields.io/github/contributors/nsc-de/rster.svg?style=for-the-badge
[contributors-url]: https://github.com/nsc-de/rster/graphs/contributors
[version-shield]: https://img.shields.io/npm/v/rster.svg?style=for-the-badge
[downloads-shield]: https://img.shields.io/npm/dt/rster.svg?style=for-the-badge
[coverage-shield]: https://img.shields.io/codecov/c/github/nsc-de/rster?style=for-the-badge
[coverage-url]: https://codecov.io/gh/nsc-de/rster

<!--Build With-->

[typescript-shield]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[typescript-url]: https://www.typescriptlang.org/
[npm-package-manager-shield]: https://img.shields.io/badge/npm-red?style=for-the-badge&logo=npm&logoColor=white
[npm-package-manager-url]: https://www.npmjs.com/
[express-shield]: https://img.shields.io/badge/Express.js-404D59?style=for-the-badge
[express-url]: https://expressjs.com/
[jest-shield]: https://img.shields.io/badge/-Jest-C21325?style=for-the-badge&logo=jest&logoColor=white
[jest-url]: https://jestjs.io/
[nodejs-shield]: https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white
[nodejs-url]: https://nodejs.org/en/
[eslint-shield]: https://img.shields.io/badge/eslint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white
[eslint-url]: https://eslint.org/
[turbo-shield]: https://img.shields.io/badge/turbo-000000?style=for-the-badge&logo=turbo&logoColor=white
[turbo-url]: https://turbo.build/
[changesets-shield]: https://img.shields.io/badge/changesets-1E1E1E?style=for-the-badge&logo=changesets&logoColor=white
[changesets-url]: https://github.com/changesets/changesets

<!-- Contact Shields -->

[contact-twitter-shield]: https://img.shields.io/badge/@nsc_dev-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white
[contact-twitter-url]: https://twitter.com/nsc_dev
[contact-github-shield]: https://img.shields.io/badge/@nsc--de-100000?style=for-the-badge&logo=github&logoColor=white
[contact-github-url]: https://github.com/nsc-de/
