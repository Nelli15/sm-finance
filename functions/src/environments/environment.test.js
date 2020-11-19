const prodEnvironment = require('./environment')

module.exports = {
  ...prodEnvironment,
  isTest: true,
  schema: {
    projects: 'test-projects'
  }
}
