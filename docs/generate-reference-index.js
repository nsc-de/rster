const fs = require("fs");
const path = require("path");

const basePath = path.join(__dirname, "..");
const packagesFolder = path.join(basePath, "packages");

const scanFolders = [
  path.resolve(packagesFolder, "core"),
  path.resolve(packagesFolder, "adapter"),
  path.resolve(packagesFolder, "addon"),
  path.resolve(packagesFolder, "worker"),
];

const packagesIgnored = ["rster"];

const included_in_rster = Object.keys(
  JSON.parse(
    fs.readFileSync(path.join(packagesFolder, "core/rster/package.json"))
  ).dependencies
)
  .filter((package) => package.startsWith("@rster/"))
  .map((package) => package.substring(7));

const packages = scanFolders.flatMap((folder) => {
  return fs.readdirSync(folder).map((package) => path.join(folder, package));
});

const packagesFiltered = packages
  .filter((package) => !packagesIgnored.includes(package))
  .sort()
  .map((package) => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(package, "package.json"))
    );

    const packagePath = packageJson.name.startsWith("@rster/")
      ? packageJson.name.slice(7)
      : packageJson.name;

    return {
      name: packageJson.name,
      path: packagePath,
      included_in_rster: included_in_rster.includes(package),
      // packageJson,
    };
  });

fs.writeFileSync(
  path.join(basePath, "docs", "reference-index.json"),
  JSON.stringify(packagesFiltered, null, 2)
);

console.log(
  `\n\nFound ${packagesFiltered.length} packages:\n\n${packagesFiltered
    .map((p) => `- ${p.name}`)
    .join("\n")}\n\n`
);
