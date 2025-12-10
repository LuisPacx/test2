const webpack = require('webpack');

module.exports = {
  webpack: {
    plugins: [
      new webpack.ContextReplacementPlugin(/jazz-midi/, (data) => {
        delete data.dependencies[0].critical;
        return data;
      })
    ]
  }
};
