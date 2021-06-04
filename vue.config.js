const { resolve } = require('path')
const path = require('path')
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  pages: {
    index: {
      entry: './example/app.js',
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  // output: {
  //   library: 'graph-basic',
  //   libraryTarget: 'umd',
  //   path: path.resolve(__dirname, 'dist'),
  //   publicPath: '/',
  //   filename: 'graph-basic.min.js'
  // },
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@graphin', resolve('src/components/graphin'))
      .set('@graphin-components', resolve('src/components/graphin-components'))
      .set('@graphin-icons', resolve('src/components/graphin-icons'))
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [
        // 这个是加上自己的路径,不能使用(如下:alias)中配置的别名路径
        path.resolve(__dirname, './src/assets/less/variables.less')
      ]
    }
  },
  productionSourceMap: false
  // optimization: {
  //   minimizer: [
  //     new UglifyJsPlugin({
  //       sourceMap: false
  //     })
  //   ]
  // }
}
