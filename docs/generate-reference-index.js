const fs = require("fs");
const path = require("path");

const basePath = path.join(__dirname, "..");
const packagesFolder = path.join(basePath, "packages");

const packagesIgnored = ["rster"];

const included_in_rster = Object.keys(
  JSON.parse(fs.readFileSync(path.join(packagesFolder, "rster/package.json")))
    .dependencies
)
  .filter((package) => package.startsWith("@rster/"))
  .map((package) => package.substring(7));

const packages = fs.readdirSync(packagesFolder);

const packagesFiltered = packages
  .filter((package) => !packagesIgnored.includes(package))
  .sort()
  .map((package) => ({
    name: JSON.parse(
      fs.readFileSync(path.join(packagesFolder, package, "package.json"))
    ).name,
    path: package,
    included_in_rster: included_in_rster.includes(package),
  }));

fs.writeFileSync(
  path.join(basePath, "docs", "reference-index.json"),
  JSON.stringify(packagesFiltered, null, 2)
);

console.log(
  `\n\nFound ${packagesFiltered.length} packages:\n\n${packagesFiltered
    .map((p) => `- ${p.name}`)
    .join("\n")}\n\n`
);
