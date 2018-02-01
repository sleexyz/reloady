//@flow
import tmp from "tmp";
import fs from "fs";
import * as TestUtils from "./test_utils";

describe("when reloady is run in a jest test", () => {
  it("can continuously reload code", async () => {
    TestUtils.inTempDir();
    const reloadyPath = require.resolve("../lib");

    fs.writeFileSync("./package.json", "{}");

    fs.writeFileSync(
      "./debug.js",
      `module.exports = input => {console.log(input);};`
    );

    fs.writeFileSync(
      "./index.test.js",
      `
const reloady = require(${JSON.stringify(reloadyPath)});

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

    expect(await jestProcess.getOutput()).toContain("foo");

    fs.writeFileSync(
      "./debug.js",
      `module.exports = () => {console.log("bar");};`
    );

    expect(await jestProcess.getOutput()).toContain("bar");

    fs.writeFileSync(
      "./debug.js",
      `module.exports = () => {console.log("baz");};`
    );

    expect(await jestProcess.getOutput()).toContain("baz");
    jestProcess.exit();
  });
});
