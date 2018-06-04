const path = require('path')
const alias = require('../vue/scripts/alias')

const resolve = p => path.resolve(__dirname, '../', p)

module.exports = Object.assign({}, alias, {
  mp: resolve('src'),
})
