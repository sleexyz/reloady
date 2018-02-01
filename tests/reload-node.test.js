//@flow
import tmp from "tmp";
import fs from "fs";
import childProcess from "child_process";
import * as TestUtils from "./test_utils";

describe("when reloady is run with node", () => {
  TestUtils.withTmpDir();

  it("can continuously reload code", async () => {
    fs.writeFileSync("./package.json", '{ "license": "MIT" }');
    childProcess.execSync("yarn link reloady");

    fs.writeFileSync(
      "./debug.js",
      `module.exports = input => {console.error(input);};`
    );

    fs.writeFileSync(
      "./index.js",
      `
const reloady = require("reloady");

(async () => {
  await reloady({
    path: require.resolve("./debug"),
    input: "foo"
  });
})();
`
    );

    const nodeProcess = new TestUtils.WrappedProcess("node index.js");
    await TestUtils.wait(2000);

    fs.writeFileSync(
      "./debug.js",
      `module.exports = () => {console.error("bar");};`
    );
    await TestUtils.wait(1000);

    fs.writeFileSync(
      "./debug.js",
      `module.exports = () => {console.error("baz");};`
    );
    await TestUtils.wait(1000);
    const output = nodeProcess.getOutput();
    expect(output).toContain("foo");
    expect(output).toContain("bar");
    expect(output).toContain("baz");

    nodeProcess.exit();
  });
});
