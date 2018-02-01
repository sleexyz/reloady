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

export function withWrappedProcess(shellCmd: string) {
  const wrappedProcess = new ProcessWrapper(shellCmd);
  afterEaches.push(() => {
    wrappedProcess.exit();
  });
  return wrappedProcess;
}

class ProcessWrapper {
  state: {
    queue: Array<string>,
    resolve: ?(string) => void
  } = {
    queue: [],
    resolve: undefined
  };

  jestProcess: *;

  constructor(shellCmd: string) {
    this.jestProcess = childProcess.spawn("sh", ["-c", shellCmd]);
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

export function inTempDir() {
  const cwd = process.cwd();
  const tmpDir = tmp.dirSync({ unsafeCleanup: true });
  process.chdir(tmpDir.name);
  pushAfterEach(() => {
    process.chdir(cwd);
    tmpDir.removeCallback();
  });
}
