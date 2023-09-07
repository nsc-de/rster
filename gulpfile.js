const gulp = require("gulp");
const run = require("gulp-run");
var taskListing = require("gulp-task-listing");
var del = import("del").then((m) => m.deleteAsync);

const { packages } = require("./package-list.json");

// Add a task to render the output
gulp.task("help", taskListing);
gulp.task("default", gulp.series("help"));

packages.forEach((pkg) => {
  gulp.task(`packages:${pkg.name}:ci`, () =>
    run(`npm ci`, { cwd: `./packages/${pkg.name}` }).exec()
  );

  gulp.task(`packages:${pkg.name}:install`, () =>
    run(`npm install`, { cwd: `./packages/${pkg.name}` }).exec()
  );

  gulp.task(`packages:${pkg.name}:upgrade`, () =>
    run(`npm upgrade`, { cwd: `./packages/${pkg.name}` }).exec()
  );

  gulp.task(`packages:${pkg.name}:test`, () =>
    run(`npm run test`, { cwd: `./packages/${pkg.name}` }).exec()
  );

  gulp.task(`packages:${pkg.name}:build`, () =>
    run(`npm run build`, { cwd: `./packages/${pkg.name}` }).exec()
  );

  gulp.task(
    `packages:${pkg.name}:prepack`,
    gulp.series(
      `packages:${pkg.name}:ci`,
      gulp.parallel(`packages:${pkg.name}:test`, `packages:${pkg.name}:build`)
    )
  );

  gulp.task(
    `packages:${pkg.name}:pack`,
    gulp.series(`packages:${pkg.name}:prepack`, () =>
      run(`npm pack`, { cwd: `./packages/${pkg.name}` }).exec()
    )
  );

  gulp.task(
    `packages:${pkg.name}:publish:gpr`,
    gulp.series(`packages:${pkg.name}:pack`, () =>
      run(
        `npm publish --access=public --registry https://npm.pkg.github.com/`,
        {
          cwd: `./packages/${pkg.name}`,
        }
      ).exec()
    )
  );

  gulp.task(
    `packages:${pkg.name}:publish:npm`,
    gulp.series(`packages:${pkg.name}:prepack`, () =>
      run(`npm publish --access=public`, {
        cwd: `./packages/${pkg.name}`,
      }).exec()
    )
  );

  gulp.task(`packages:${pkg.name}:test`, () =>
    run(`npm run test`, { cwd: `./packages/${pkg.name}` }).exec()
  );

  gulp.task(`packages:${pkg.name}:build`, () =>
    run(`npm run build`, { cwd: `./packages/${pkg.name}` }).exec()
  );

  gulp.task(`packages:${pkg.name}:clean:build`, async () => {
    return await (
      await del
    )([`./packages/${pkg.name}/lib`, `./packages/${pkg.name}/coverage`]);
  });

  gulp.task(
    `packages:${pkg.name}:clean:dependencies`,
    async () => await (await del)([`./packages/${pkg.name}/node_modules`])
  );

  gulp.task(
    `packages:${pkg.name}:clean`,
    gulp.parallel(
      `packages:${pkg.name}:clean:build`,
      `packages:${pkg.name}:clean:dependencies`
    )
  );
});

[
  "build",
  "ci",
  "install",
  "pack",
  "prepack",
  "publish:gpr",
  "publish:npm",
  "test",
  "upgrade",
  "clean",
  "clean:build",
  "clean:dependencies",
].forEach((task) => {
  gulp.task(
    `packages:all:${task}`,
    gulp.parallel([...packages.map((pkg) => `packages:${pkg.name}:${task}`)])
  );
  gulp.task(task, gulp.series(`packages:all:${task}`));
});
