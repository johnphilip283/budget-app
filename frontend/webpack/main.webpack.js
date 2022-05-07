module.exports = {
  resolve: {
    extensions: ['.ts', '.js', '.scss'],
  },
  entry: './electron/main.ts',
  module: {
    rules: require('./rules.webpack'),
  },
}
