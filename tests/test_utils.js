// @flow
import childProcess from "child_process";
import tmp from "tmp";

let afterEaches = [];
afterEach(() => {
  for (const fn of afterEaches) {
    fn();
  }
  afterEaches = [];
});
export function pushAfterEach(fn: () => void) {
  afterEaches.push(fn);
}

export async function wait(n: number) {
  await new Promise(resolve => setTimeout(resolve, n));
}

export class WrappedProcess {
  state: {
    queue: Array<string>,
    resolve: ?(string) => void
  } = {
    queue: [],
    resolve: undefined
  };

  jestProcess: *;

  constructor(shellCmd: string) {
    this.jestProcess = childProcess.exec(shellCmd);
    this.jestProcess.stderr.on("data", chunk => {
      this.state.queue.push(chunk.toString());
      if (this.state.resolve) {
        (this.state.resolve: any)(this._getOutput());
      }
    });
  }

  _getOutput(): string {
    const output = this.state.queue.join("");
    this.state.queue = [];
    delete this.state.resolve;
    return output;
  }

  getOutput(): Promise<string> {
    return new Promise(resolve => {
      if (this.state.queue.length > 0) {
        return resolve(this._getOutput());
      }
      this.state.resolve = resolve;
    });
  }
  exit() {
    this.jestProcess.kill();
  }
}

export function withTmpDir() {
  const cwd = process.cwd();
  let tmpDir;
  beforeEach(() => {
    tmpDir = tmp.dirSync({ unsafeCleanup: true });
    process.chdir(tmpDir.name);
  });
  afterEach(() => {
    process.chdir(cwd);
    tmpDir.removeCallback();
  });
}
