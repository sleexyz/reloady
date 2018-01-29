const reloady = require("./");
async function main () {
  const foo = 1;
  const bar = 2;
  await reloady('./debug', { foo, bar });
}

main();
