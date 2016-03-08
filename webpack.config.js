/**
 * Created by Trevor.Zablocki on 3/2/2016.
 */
module.exports = {
  entry: "./src/jsx/app.js",
  output: {
    path: __dirname,
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loaders: ["style", "css", "sass"]
      },
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel?presets[]=es2015&presets[]=react&presets[]=stage-0' // 'babel-loader' is also a legal name to reference
      }
    ]
  }
};
