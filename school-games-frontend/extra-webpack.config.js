const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin');

module.exports = {
  plugins: [
    new SVGSpritemapPlugin('src/avatars/*.svg', {
      output: {
        filename: 'assets/avatars.svg'
      }
    })
  ],
  module: {
    rules: [
      {
        test: /src\/avatars/,
        loader: 'raw-loader'
      }
    ]
  }
}
