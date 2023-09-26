import commander from "commander";
import fs from "fs";
import path from "path";

const version = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf-8")
).version;

export const program = new commander.Command();

program.version(version).description("Info Explorer CLI").name("info-explorer");

program
  .command("start")
  .description("Start the Info Explorer server")
  .option("-p, --port <port>", "Port to listen on", "3001")
  .option("-d, --debug", "Enable debug logging")
  .option(
    "-a, --address <address>",
    "Address of the api server's info endpoint",
    "http://localhost:3000/api/info"
  )
  .action(async (options) => {
    const { openServer } = await import("./index.js");
    openServer({
      port: parseInt(options.port),
      debug: options.debug,
      address: options.address,
    });
  });
