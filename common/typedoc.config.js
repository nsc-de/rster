const path = require("path");

module.exports = function (p) {
  /** @type {import('typedoc').TypeDocOptions} */
  return {
    entryPoints: [path.resolve(p, "./src/index.ts")],
    out: path.resolve(__dirname, "../docs/static/typedoc", path.basename(p)),
  };
};
