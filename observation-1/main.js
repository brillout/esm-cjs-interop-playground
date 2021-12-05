const moduleDefaut = require('./hi.js')
const { msg } = require('./hi.js')

console.log("`require('./hi.js')`: ", moduleDefaut)
console.log("`require('./hi.js').msg`: ", msg)
