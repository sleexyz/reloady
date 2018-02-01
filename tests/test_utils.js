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
    queue: Array<string>
  } = {
    queue: []
  };

  jestProcess: *;

  constructor(shellCmd: string) {
    this.jestProcess = childProcess.exec(shellCmd);
    this.jestProcess.stderr.on("data", chunk => {
      this.state.queue.push(chunk.toString());
    });
  }

  getOutput(): string {
    return this.state.queue.join("");
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
