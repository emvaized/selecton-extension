const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ConcatPlugin = require('@mcler/webpack-concat-plugin');
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  /// background script
  entry: {
    background: "./src/functions/background.js"
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "[name].js"
  },
  plugins: [
    /// content scripts
    new ConcatPlugin({
      name: 'content',
      outputPath: './',
      fileName: '[name].js',
      filesToConcat: [
        "./src/data/**",
        [
          "./src/functions/**",
          "!./src/functions/background.js",
        ],
        "./src/ui/**/**",
        "./src/index.js",
      ]
    }),
    /// static files
    new CopyPlugin({
      patterns: [
        "src/index.css",
        { 
          from: "manifest.json", 
          to: "manifest.json",
          transform(content, absoluteFrom) {
            const manifest = JSON.parse(content.toString());

            manifest['background']['scripts'] = ["./background.js"];
            manifest['background']['service_worker'] = "./background.js";
            manifest['content_scripts'][0]['js'] = [ "./content.js" ];
            manifest['content_scripts'][0]['css'] = [ "./index.css" ];

            return JSON.stringify(manifest);
          },
        },
        { from: "_locales", to: "_locales" },
        { from: "icons", to: "icons" },
        { from: "popup", to: "popup" },
        { from: "options", to: "options" },
        /// additional dependencies for toolbar popup and options page
        { from: "src/data/configs.js", to: "src/data/" },
        { from: "src/data/currencies.js", to: "src/data/" },
      ],
    }),
  ],
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(), 
      new CssMinimizerPlugin(),
      new JsonMinimizerPlugin({exclude: "manifest.json"}),
    ],
  },
};