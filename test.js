const liveDebug = require("./");

async function main () => {
  const foo = 1;
  const bar = 2;
  eval(liveDebug());
}

main();
