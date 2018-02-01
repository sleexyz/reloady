// @flow
import chokidar from "chokidar";
import path from "path";
import fs from "fs";
import os from "os";
import tmp from "tmp";

type State = {
  resolve: ?(any) => void
};

type Options = {
  path: string,
  input: any
};

module.exports = async function reloady(options: Options): Promise<void> {
  const { path: modulePath, input } = options;

  let state: State = {
    resolve: undefined
  };

  {
    const pathName = require.resolve(modulePath);
    const watcher = chokidar.watch(pathName);
    watcher.on("change", () => {
      state.resolve && state.resolve();
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
  return (require: any)(modulePath);
}

function requireRecachedJest(modulePath: string) {
  const newPath = tmp.tmpNameSync({ dir: os.tmpdir() });
  fs.linkSync(modulePath, newPath);
  return (require: any)(newPath);
}

function isRunningInJest(): boolean {
  return !!(require: any).requireActual;
}
