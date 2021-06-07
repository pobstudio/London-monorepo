const withTM = require('next-transpile-modules')([
  '@pob/protocol',
  '@pob/common',
]);

module.exports = withTM({
  // images: {
  //   domains: ['preview.pob.vercel.app'],
  // },
  webpack: (config) => {
    // Need this locally or else react-spring gets mad on hot reloads
    config.module.rules.push({ test: /react-spring/, sideEffects: true });
    return config;
  },
});
