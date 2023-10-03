const path = require("path");

module.exports = function (p) {
  /** @type {import('typedoc').TypeDocOptions} */
  const options = {
    entryPoints: [path.resolve(p, "./src/index.ts")],
    out: path.resolve(
      __dirname,
      "../docs/static/docs/api-reference/",
      path.basename(p)
    ),
    tsconfig: path.resolve(p, "./tsconfig.json"),
    // includeDeclarations: true,
    externalPattern: "node_modules/",
    exclude: ["node_modules"],
    excludeExternals: false,
    sourceLinkTemplate: `https://github.com/nsc-de/rster/tree/{gitRevision}/{path}#L{line}`,
    includeVersion: true,
    excludeInternal: true,
  };

  return options;
};
