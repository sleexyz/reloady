import sane from "sane";
import path from "path";
import fs from "fs";
import os from "os";
import tmp from "tmp";

type State = {
  resolve: ?Promise<void>
};

module.exports = async function reloady(options): Promise<void> {
  const { path: modulePath, input } = options;

  let state: State = {
    resolve: undefined
  };

  {
    const pathName = require.resolve(modulePath);
    const dir = path.dirname(pathName);
    const watcher = sane(dir);
    watcher.on("change", filename => {
      if (filename === path.basename(pathName)) {
        state.resolve();
      }
    });
  }
  while (true) {
    try {
      const fn = requireRecached(modulePath);
      await fn(input);
    } catch (e) {
      console.error(e);
    }
    const action = await new Promise(resolve => {
      state.resolve = resolve;
    });
  }
};

function requireRecached(modulePath: string) {
  if (isRunningInJest()) {
    return requireRecachedJest(modulePath);
  }
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath);
}

function requireRecachedJest(modulePath: string) {
  const newPath = tmp.tmpNameSync({ dir: os.tmpdir() });
  fs.linkSync(modulePath, newPath);
  return require(newPath);
}

function isRunningInJest(): boolean {
  return !!require.requireActual;
}
