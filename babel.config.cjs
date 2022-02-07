module.exports = process.env.CYPRESS_ENV
  ? {}
  : { presets: ['@vue/babel-preset-app'] }
