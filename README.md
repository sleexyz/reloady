# async-debug

Continuously execute and re-execute debugging code in any async function body.

## Usage

```js
const asyncDebug = require("asyncDebug");

(async () => {

  const foo = 1;
  const bar = 2;
  await eval(asyncDebug());

})();
```

Then edit `./debug.js`. The code will have all the variables in scope in the stack frame it was executed in.


```js
// example ./debug.js

console.log(foo); // 3
```

