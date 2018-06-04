const path = require('path')
const buble = require('rollup-plugin-buble')
const alias = require('rollup-plugin-alias')
const cjs = require('rollup-plugin-commonjs')
const replace = require('rollup-plugin-replace')
const node = require('rollup-plugin-node-resolve')
const flow = require('rollup-plugin-flow-no-whitespace')
const version = process.env.VERSION || require('../package.json').version
const weexVersion = process.env.WEEX_VERSION || require('../vue/packages/weex-vue-framework/package.json').version

const banner =
  '/*!\n' +
  ' * Vue.js v' + version + '\n' +
  ' * (c) 2014-' + new Date().getFullYear() + ' Evan You\n' +
  ' * Released under the MIT License.\n' +
  ' */'

const weexFactoryPlugin = {
  intro () {
    return 'module.exports = function weexFactory (exports, document) {'
  },
  outro () {
    return '}'
  }
}

const aliases = require('./alias')
const resolve = p => {
  const base = p.split('/')[0]
  if (aliases[base]) {
    return path.resolve(aliases[base], p.slice(base.length + 1))
  } else {
    return path.resolve(__dirname, '../', p)
  }
}

const builds = {
  // MP compiler (CommonJS).
  'mpvue-template-compiler': {
    mp: true,
    entry: resolve('mp/entry-compiler.js'),
    dest: resolve('packages/mpvue-template-compiler/build.js'),
    format: 'cjs',
    external: Object.keys(require('../packages/mpvue-template-compiler/package.json').dependencies),
    banner
  },
  // MP runtime development build (Browser)
  'mpvue-runtime-development': {
    mp: true,
    entry: resolve('mp/entry-runtime.js'),
    dest: resolve('dist/mpvue.js'),
    format: 'umd',
    env: 'development',
    moduleName: 'MpVue',
    banner
  },
  // MP runtime production build (Browser)
  'mpvue-runtime-production': {
    mp: true,
    entry: resolve('mp/entry-runtime.js'),
    dest: resolve('dist/mpvue.min.js'),
    format: 'umd',
    env: 'production',
    moduleName: 'MpVue',
    banner
  }
}

function genConfig (name) {
  const opts = builds[name]
  const config = {
    input: opts.entry,
    external: opts.external,
    plugins: [
      replace({
        __WEEX__: !!opts.weex,
        __WEEX_VERSION__: weexVersion,
        __VERSION__: version
      }),
      flow(),
      buble(),
      alias(Object.assign({}, aliases, opts.alias))
    ].concat(opts.plugins || []),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || 'Vue'
    }
  }

  if (opts.env) {
    config.plugins.push(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env)
    }))
  }

  Object.defineProperty(config, '_name', {
    enumerable: false,
    value: name
  })

  return config
}

if (process.env.TARGET) {
  module.exports = genConfig(process.env.TARGET)
} else {
  exports.getBuild = genConfig
  exports.getAllBuilds = () => Object.keys(builds).map(genConfig)
}
