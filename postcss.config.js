module.exports = {
  plugins: [
    require('postcss-simple-vars')(),
    require('postcss-focus')(),
    require('autoprefixer')({
      browsers: [ 'last 2 versions', 'IE > 8' ]
    }),
    require('postcss-reporter')({
      clearMessages: true
    })
  ]
}
