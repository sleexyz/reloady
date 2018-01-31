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
      const fn = require(modulePath);
      await fn(input);
    } catch (e) {
      console.error(e);
    }
    const action = await new Promise(resolve => {
      state.resolve = resolve;
    });
    uncache(modulePath);
  }
};

function uncache(modulePath: string) {
  if (isRunningInJest()) {
    const newPath = tmp.tmpNameSync({ dir: os.tmpdir() });
    console.log(newPath);
    fs.linkSync(modulePath, newPath);
    jest.unmock(modulePath);
    jest.mock(modulePath, () => {
      return require.requireActual(newPath);
    }, { virtual: true });
    return;
  }
  delete require.cache[require.resolve(modulePath)];
}


function isRunningInJest(): boolean {
  return !!require.requireActual;
}
