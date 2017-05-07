var child_process = require('child_process');

module.exports =
new class Utils {
  exec (command, options = {}) {
    console.log(`some-package: utils.exec: ${command}`);
    return (
      new Promise((resolve, reject) => {
        child_process.exec(
          command,
          Object.assign(options, {
            cwd: atom.project.rootDirectories[0].path,
            maxBuffer: 2 * (2 ** 20), // 2MB
          }),
          (err, stdout, stderr) => {
            // console.log("===== some-package: utils.exec =====");
            // console.log("=== error ===");
            // console.log(err);
            // console.log("=== stdout ===");
            // console.log(stdout);
            // console.log("=== stderr ===");
            // console.log(stderr);
            err ? reject(err) : resolve(stdout, stderr)
          }
        );
      })
    );
  }
}
