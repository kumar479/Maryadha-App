const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add fallback for native-only modules on web
  config.resolve.fallback = {
    ...config.resolve.fallback,
    '@stripe/stripe-react-native': false,
  };

  // Add alias for platform-specific files
  config.resolve.alias = {
    ...config.resolve.alias,
    '@stripe/stripe-react-native': false,
  };

  // Set the EXPO_ROUTER_APP_ROOT environment variable
  config.plugins.push(
    new config.webpack.DefinePlugin({
      'process.env.EXPO_ROUTER_APP_ROOT': JSON.stringify(path.resolve(__dirname, 'app')),
    })
  );

  // Add resolve configuration for better module resolution
  config.resolve.modules = [
    path.resolve(__dirname, 'node_modules'),
    path.resolve(__dirname, 'app'),
    'node_modules'
  ];

  return config;
}; 