//@flow
import tmp from "tmp";
import fs from "fs";
import childProcess from "child_process";
import * as TestUtils from "./test_utils";

describe("when reloady is run in a jest test", () => {
  TestUtils.withTmpDir();

  it("can continuously reload code", async () => {
    fs.writeFileSync("./package.json", '{ "license": "MIT" }');
    childProcess.execSync("yarn link reloady && yarn ");

    fs.writeFileSync(
      "./debug.js",
      `module.exports = input => {console.log(input);};`
    );

    fs.writeFileSync(
      "./index.test.js",
      `
const reloady = require("reloady");

it("runs", async () => {
  await reloady({
    path: require.resolve("./debug"),
    input: "foo"
  });
});
`
    );

    const jestProcess = new TestUtils.WrappedProcess(
      "CI=true jest --json index.test.js"
    );
    await TestUtils.wait(1000);
    fs.writeFileSync(
      "./debug.js",
      `module.exports = () => {console.log("bar");};`
    );
    await TestUtils.wait(500);
    fs.writeFileSync(
      "./debug.js",
      `module.exports = () => {console.log("baz");};`
    );
    await TestUtils.wait(500);
    const output = jestProcess.getOutput();
    expect(output).toContain("bar");
    expect(output).toContain("foo");
    expect(output).toContain("baz");

    jestProcess.exit();
  });
});
