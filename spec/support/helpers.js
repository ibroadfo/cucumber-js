_ = require('lodash');

global.requireLib = function (modulePath) {
  return require('../../lib/' + modulePath);
};

global.createStubbedObject = function (stubs) {
  return _.mapValues(stubs, function(value) {
    return sinon.stub().returns(value);
  });
};
