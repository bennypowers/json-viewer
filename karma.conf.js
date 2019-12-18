const { createDefaultConfig } = require('@open-wc/testing-karma');
const merge = require('webpack-merge');

module.exports = config => {
  config.set(
    merge(createDefaultConfig(config), {
      files: [{ pattern: '*.test.js', type: 'module' }],
      esm: { nodeResolve: true },
    }),
  );
  return config;
};
