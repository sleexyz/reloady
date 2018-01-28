module.exports = function asyncDebug (filename) {
  return `(async () => {
  while (true) {
    try {
      const code = require("fs").readFileSync("./debug.js").toString();
      await eval("(async () => {" + code + "})()");
    } catch (e) {
      console.error(e);
    }
    debugger;
  }
})();`
};
