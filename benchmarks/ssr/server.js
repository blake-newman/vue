'use strict'

root.performance = {
  now: function () {
    var hrtime = process.hrtime()
    return ((hrtime[0] * 1000000 + hrtime[1] / 1000) / 1000).toFixed(2)
  }
}

const Vue = require('../../dist/vue.common.js')
const compiler = require('../../dist/compiler.common.js')
const renderer = require('../../dist/server-renderer.js')()
const renderToStream = renderer.renderToStream
const renderToString = renderer.renderToString
let gridComponent = require('./grid.js')

function createCompiledOptions (options) {
  const res = compiler.compileToFunctions(options.template, {
    preserveWhitespace: false
  })
  Object.assign(options, res)
  delete options.template
  if (options.components) {
    const keys = Object.keys(options.components)
    let total = keys.length
    while (total) {
      const name = keys[total - 1]
      options.components[name] = createCompiledOptions(options.components[name])
      total--
    }
  }
  return options
}

gridComponent = createCompiledOptions(gridComponent)
root.s = root.performance.now()

renderToString(new Vue(gridComponent))
const fin = root.performance.now() - root.s
console.log('--- renderToString --- ')
console.log('Complete time: ' + fin)
console.log()

console.log('--- renderToStream --- ')
root.s = root.performance.now()
const stream = renderToStream(new Vue(gridComponent))

stream.on('data', chunk => {
  console.log('Chunk time: ' + (root.performance.now() - root.s))
})
stream.on('end', () => {
  console.log('Complete time: ' + (root.performance.now() - root.s))
})
