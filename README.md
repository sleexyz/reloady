# reloady

Your code reload buddy.

![buddy](https://user-images.githubusercontent.com/1505617/35489842-be91bb66-0468-11e8-88e8-babe130ac3a2.png)

Re-execute functions on code changes, from anywhere in your code.

Great for:
- debugging slow, lengthy tests without having to restart each time
- live-coding anything in node.js

## Usage

You can initialize Reloady anywhere in your code. Just give it 

1. a path to a module with a function as a default export
2. (optional) an argument to call that function with

```js
const reloady = require("reloady");

(async () => {
  const foo = 1;
  const bar = 2;
  await reloady("./debug", { foo, bar}));
})();
```

Reloady returns a promise that never resolves, so if you want you can `await` it in async function bodies
as a sort of "debugger".

---

Now everytime you change `./debug.js`, the module will be re-required and its default export will be re-invoked
with the given arguments.

```js
// ./debug.js

module.exports = async ({ foo, bar }) => {
  console.log(foo); // 1
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(bar); // 2
}
```

---

Reloady reloads by sending SIGHUP to its node process.

The following one-liner starts a decent a reloady workflow:

```
sh -c 'node ./test.js & (sleep 1 && ls ./debug.js | entr kill -s HUP $!) & wait'
```

It will

1. execute `./test.js`
2. send SIGHUP on changes to `./debug.js` via [entr](http://entrproject.org/)
3. close everything cleanly on Ctrl-C
