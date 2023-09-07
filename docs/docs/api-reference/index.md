---
title: API Reference
---

# API Reference

## List of Packages

Rster consists of a number of packages. The main package is `rster`. All other packages are accessible through `@rster/{package-name}`. The packages are listed below with a link to their API reference.

- [rster](rster)
- [@rster/authorization](authorization)
- [@rster/basic](basic)
- [@rster/builder](builder)
- [@rster/common](common)
- [@rster/generator](generator)
- [@rster/info](info)
- [@rster/ping](ping)
- [@rster/types](types)
- [@rster/util](util)
- [@rster/worker-express](worker-express)

---

## More Information

| Package                                 | Description                                         | Included in main package                          | Links                                                                                                                                                                                 |
| --------------------------------------- | --------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [rster](rster)                          | The main package.                                   | _This is the main package_                        | [![npm-shield][npm-badge]](https://www.npmjs.com/package/rster) [![source-shield][source-badge]](https://github.com/nsc-de/rster/tree/master/packages/rster)                          |
| [@rster/authorization](authorization)   | Authorization middleware.                           | <p style={{textAlign: "center", margin:0}}>❌</p> | [![npm-shield][npm-badge]](https://www.npmjs.com/package/@rster/authorization) [![source-shield][source-badge]](https://github.com/nsc-de/rster/tree/master/packages/authorization)   |
| [@rster/basic](basic)                   | Basic authentication middleware.                    | <p style={{textAlign: "center", margin:0}}>✅</p> | [![npm-shield][npm-badge]](https://www.npmjs.com/package/@rster/basic) [![source-shield][source-badge]](https://github.com/nsc-de/rster/tree/master/packages/basic)                   |
| [@rster/builder](builder)               | Builder for creating a Rster instance.              | <p style={{textAlign: "center", margin:0}}>❌</p> | [![npm-shield][npm-badge]](https://www.npmjs.com/package/@rster/builder) [![source-shield][source-badge]](https://github.com/nsc-de/rster/tree/master/packages/builder)               |
| [@rster/common](common)                 | Common types and functions.                         | <p style={{textAlign: "center", margin:0}}>✅</p> | [![npm-shield][npm-badge]](https://www.npmjs.com/package/@rster/common) [![source-shield][source-badge]](https://github.com/nsc-de/rster/tree/master/packages/common)                 |
| [@rster/generator](generator)           | Generator for creating a Rster instance.            | <p style={{textAlign: "center", margin:0}}>❌</p> | [![npm-shield][npm-badge]](https://www.npmjs.com/package/@rster/generator) [![source-shield][source-badge]](https://github.com/nsc-de/rster/tree/master/packages/generator)           |
| [@rster/info](info)                     | Info middleware.                                    | <p style={{textAlign: "center", margin:0}}>✅</p> | [![npm-shield][npm-badge]](https://www.npmjs.com/package/@rster/info) [![source-shield][source-badge]](https://github.com/nsc-de/rster/tree/master/packages/info)                     |
| [@rster/ping](ping)                     | Ping middleware.                                    | <p style={{textAlign: "center", margin:0}}>✅</p> | [![npm-shield][npm-badge]](https://www.npmjs.com/package/@rster/ping) [![source-shield][source-badge]](https://github.com/nsc-de/rster/tree/master/packages/ping)                     |
| [@rster/types](types)                   | Types used to declare api.                          | <p style={{textAlign: "center", margin:0}}>✅</p> | [![npm-shield][npm-badge]](https://www.npmjs.com/package/@rster/types) [![source-shield][source-badge]](https://github.com/nsc-de/rster/tree/master/packages/types)                   |
| [@rster/util](util)                     | Utility functions.                                  | <p style={{textAlign: "center", margin:0}}>✅</p> | [![npm-shield][npm-badge]](https://www.npmjs.com/package/@rster/util) [![source-shield][source-badge]](https://github.com/nsc-de/rster/tree/master/packages/util)                     |
| [@rster/worker-express](worker-express) | Worker for running Rster in an express environment. | <p style={{textAlign: "center", margin:0}}>❌</p> | [![npm-shield][npm-badge]](https://www.npmjs.com/package/@rster/worker-express) [![source-shield][source-badge]](https://github.com/nsc-de/rster/tree/master/packages/worker-express) |

[source-badge]: https://img.shields.io/badge/source-black?style=flat-square&logo=github
[npm-badge]: https://img.shields.io/badge/npm-red?style=flat-square&logo=npm
