# reloady

Your code reload buddy.

Automatically re-execute functions on code changes, from anywhere in your code.

![buddy](https://user-images.githubusercontent.com/1505617/35489842-be91bb66-0468-11e8-88e8-babe130ac3a2.png)

Great for:
- debugging slow, lengthy tests without having to restart each time
- live-coding in node.js

## Usage

Reloady can be initialized anywhere in your code. Just give it:

1. a path to a module with a function as a default export
2. an optional argument to call the function with

```js
const reloady = require("reloady");

(async () => {
  const foo = 1;
  const bar = 2;
  await reloady("./debug", { foo, bar}));
})();
```

Reloady returns a promise that never resolves, so you `await` as a sort of persistent debugger.

---

Now every time you change `./debug.js`, the module will be re-required and re-invoked with the given arguments.

```js
// ./debug.js

module.exports = async ({ foo, bar }) => {
  console.log(foo); // 1
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(bar); // 2
}
```
