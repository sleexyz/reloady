const sane = require("sane");
const path = require("path");

module.exports = async function reloady(options) {
  const { path: modulePath, input } = options;

  let state = {
    resolve: undefined
  };
  {
    const pathName = require.resolve(modulePath);
    const dir = path.dirname(pathName);
    const watcher = sane(dir);
    watcher.on("change", (filename) => {
      if (filename === path.basename(pathName)) {
        state.resolve();
      }
    });
  }
  while (true) {
    try {
      const fn = require(modulePath);
      await fn(input);
    } catch (e) {
      console.error(e);
    }
    const action = await new Promise(resolve => {
      state.resolve = resolve;
    });
    delete require.cache[require.resolve(modulePath)];
  }
};
