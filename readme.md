List of ESM-CJS interoperability issues known to Vite Team.

# Observation 1

TypeScript transpiles ESM to CJS like this:

```ts
export default 'hi'
export const msg = 'hello'
```

```js
"use strict";
exports.__esModule = true;
exports.msg = void 0;
exports["default"] = 'hi';
exports.msg = 'hello';
```

TODO: we don't know the purpose of the line `exports.msg = void 0;`. Seems superfluous?

# Observation 2

In CJS
`exports` denotes the default export

# Observation 3

Node.js doesn't support the `__esModule` compatibility layer.

```
