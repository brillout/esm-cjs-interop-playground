List of ESM-CJS interoperability issues known to Vite Team.


# Observation 1

TypeScript transpiles ESM to CJS like this:

```ts
// ESM

export default 'hi'
export const msg = 'hello'
```

```js
// CJS

"use strict";
exports.__esModule = true;
exports.msg = void 0;
exports["default"] = 'hi';
exports.msg = 'hello';
```

TODO: I don't know the purpose of the line `exports.msg = void 0;`; seems superfluous?


# Observation 2

In CJS, `exports` always denotes the default export.

```js
// hi.js (CJS)

exports["default"] = 'hi';
exports.msg = 'hello';
```

```js
// CJS

const moduleDefaut = require('./hi.js')
const { msg } = require('./hi.js')

console.log(moduleDefaut)
console.log(msg)
```

Prints:

```
{ default: 'hi', msg: 'hello' }
hello
```

This means that the ESM default lives at `moduleDefaut.default`.


# Observation 3

Node.js doesn't support the `__esModule` compatibility layer.

```js
// hi.mjs (ESM)

export default 'hi'
export const msg = 'hello'
```

```js
const imported = await import('./hi.mjs')
console.log(imported)
```

Prints:

```
{ default: 'hi', msg: 'hello' }
```

Whereas

```ts
// hi.ts (ESM, TypeScript)

export default 'hi'
export const msg = 'hello'
```

which TypeScript tranpsiles to

```js
// hi.js (CJS)

"use strict";
exports.__esModule = true;
exports.msg = void 0;
exports["default"] = 'hi';
exports.msg = 'hello';
```

```js
const imported = await import('./hi.js')
console.log(imported)
```

Prints:

```js
{
  __esModule: true,
  default: { __esModule: true, msg: 'hello', default: 'hi' },
  msg: 'hello'
}
```

Node.js is working on supporting it: [nodejs/node#40891](https://github.com/nodejs/node/issues/40891), [nodejs/node#40902](https://github.com/nodejs/node/pull/40902).
But this will never be Node.js's default behavior as it would break existings app.

Also note how `exports["default"]` is overwritten with `exports`, leading to our next observation.


# Observation 4

When loading CJS from ESM, the default export is overwritten.

```js
exports["default"] = 'hi';
exports.msg = 'hello';
```

```js
// CJS
const moduleExports = require('./hi.js')
console.log(moduleExports)
```

Prints:

```js
{ default: 'hi', msg: 'hello' }
```

While

```js
// ESM
const moduleExports = await import('./hi.js')
console.log(moduleExports)
```

Prints:

```js
{
  default: { default: 'hi', msg: 'hello' },
  msg: 'hello'
}
```

Loading CJS from ESM overwrites the default export.


# Observation 5

When loading CJS from ESM, non-statically analysable exports are skipped.

```js
// CJS

exports.msg = 'hello';
const key = 'msg2';
exports[key] = 'bonjour';
```

```js
// ESM

const moduleExports = await import('./hi.js')
console.log(moduleExports)
```

Prints:

```
{
  default: { msg: 'hello', msg2: 'bonjour' },
  msg: 'hello'
}
```

Note how `msg` is present but `msg2` is missing at the root. The only way to access `msg2` is with `default.msg2` whereas `msg` can be accessed directly.
