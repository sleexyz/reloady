const process = require("process");

let state = {
  resolve: undefined,
  dummyInterval: undefined
};

process.on("SIGHUP", () => {
  state.resolve();
});

async function reloady(modulePath, arg) {
  try {
    const fn = require(modulePath);
    await fn(arg);
  } catch (e) {
    console.error(e);
  }
  const action = await waitNext();
  delete require.cache[require.resolve(modulePath)];
  return reloady(modulePath, arg);
};

function waitNext() {
  return new Promise((resolve, reject) => {
    state.resolve = (arg) => {
      clearInterval(state.interval);
      delete state.interval;
      resolve(arg);
    };

    // keep node from exiting
    state.interval = setInterval(() => {}, 100000000);
  });
}

reloady.reload = () => {
  state.resolve();
}

global.reloady = reloady;
module.exports = reloady;
