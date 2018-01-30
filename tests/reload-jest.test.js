//@flow

import tmp from "tmp";
import childProcess from "child_process";
import fs from "fs";

let afterEaches = [];
function pushAfterEach(fn) {
  afterEaches.push(fn);
}
afterEach(() => {
  for (const fn of afterEaches) {
    fn();
  }
  afterEaches = [];
});

function inTempDir() {
  const cwd = process.cwd();
  const tmpDir = tmp.dirSync({ unsafeCleanup: true });
  process.chdir(tmpDir.name);
  afterEaches.push(() => {
    process.chdir(cwd);
    tmpDir.removeCallback();
  });
}

describe("when run in a jest test", () => {
  it("can reload code", async () => {
    jest.setTimeout(100000);
    inTempDir();
    const reloadyPath = require.resolve("../lib");
    fs.writeFileSync(
      "./package.json",
      `
{}
`
    );
    fs.writeFileSync(
      "./index.test.js",
      `
const reloady = require(${JSON.stringify(reloadyPath)});

it("runs", async () => {
  const foo = 1;
  await reloady({
    path: require.resolve("./debug"),
    input: { foo }
  });
});
`
    );
    fs.writeFileSync(
      "./debug.js",
      `
module.exports = ({foo}) => {
  console.log(foo);
}
`
    );

    const state = {
      queue: [],
      resolve: undefined,
    };

    const jestProcess = childProcess.spawn("sh", [
      "-c",
      "CI=true jest --json index.test.js"
    ]);

    jestProcess.stderr.on("data", chunk => {
      state.queue.push(chunk.toString());
      if (state.resolve) {
        const output = state.queue.join("");
        state.queue = [];
        (state.resolve: any)(output);
        delete state.resolve;
      }
    });

    function getOutput(): Promise<string> {
      return new Promise(resolve => {
        if (state.queue.length > 0)
        state.resolve = resolve;
      });
    }


    fs.writeFileSync(
      "./debug.js",
      `
module.exports = ({foo}) => {
  console.log("foo");
}
`
    );

    await wait(1000);
    await getOutput()


    fs.writeFileSync(
      "./debug.js",
      `
module.exports = ({foo}) => {
  console.log("bar");
}
`);
    await new Promise(resolve => setTimeout(resolve, 100000));
  });
});

async function wait(n: number) {
  await new Promise(resolve => setTimeout(resolve, n));
}
