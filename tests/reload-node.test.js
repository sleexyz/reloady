//@flow
import tmp from "tmp";
import fs from "fs";
import * as TestUtils from "./test_utils";

describe("when reloady is run with node", () => {
  it("can continuously reload code", async () => {
    TestUtils.inTempDir();
    const reloadyPath = require.resolve("../lib");

    fs.writeFileSync("./package.json", "{}");

    fs.writeFileSync(
      "./debug.js",
      `module.exports = input => {console.error(input);};`
    );

    fs.writeFileSync(
      "./index.js",
      `
const reloady = require(${JSON.stringify(reloadyPath)});

(async () => {
  await reloady({
    path: require.resolve("./debug"),
    input: "foo"
  });
})();
`
    );

    const nodeProcess = TestUtils.withWrappedProcess("node index.js");
    expect(await nodeProcess.getOutput()).toContain("foo");

    fs.writeFileSync(
      "./debug.js",
      `module.exports = () => {console.error("bar");};`
    );
    expect(await nodeProcess.getOutput()).toContain("bar");

    fs.writeFileSync(
      "./debug.js",
      `module.exports = () => {console.error("baz");};`
    );
    expect(await nodeProcess.getOutput()).toContain("baz");
  });
});
