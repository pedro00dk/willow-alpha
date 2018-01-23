var path = require("path")
var webpack = require('webpack')


module.exports = {
    context: __dirname,

    entry: {
        App: './frontend/App',
        vendors: ['react']
    },

    output: {
        path: path.resolve('./static/bundles/local/'),
        filename: "[name]-[hash].js"
    },

    externals: [],

    plugins: [
        new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
    ],

    module: {
        loaders: [
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    'file?hash=sha512&digest=hex&name=[hash].[ext]',
                    'image-webpack?bypassOnDebug'
                ]
            }
        ]
    },

    resolve: {
        modulesDirectories: ['node_modules', 'bower_components'],
        extensions: ['', '.js', '.jsx']
    }
}