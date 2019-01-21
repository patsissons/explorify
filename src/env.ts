// eslint-disable-next-line no-process-env, prefer-object-spread
const env = Object.assign({}, process.env);

const prefixPattern = /^REACT_APP_/i;
Object.keys(env)
  .filter(prefixPattern.test.bind(prefixPattern))
  .reduce((env, key) => {
    env[key.replace(prefixPattern, '')] = env[key];

    return env;
  }, env);

export default env;
