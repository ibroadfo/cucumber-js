sinon.stubStub = function (obj, methodName) {
  obj[methodName] = function () {};
  return sinon.stub(obj, methodName);
};

createSpy = jasmine.createSpy;
createSpyObj = jasmine.createSpyObj;

createStubbedObject = function (name, stubs) {
  var spy = createSpy(name);
  for (var stubMethod in stubs) {
    spy[stubMethod] = function () {};
    sinon.stub(spy, stubMethod).returns(stubs[stubMethod]);
  }
  return (spy);
};

createEmittingSpy = function (name) {
  var spy = createSpy(name);
  spy.callbacks = {};
  spy.on        = function () {};
  spy.emit      = function () {
    var args  = Array.prototype.slice.call(arguments);
    var event = args.shift();

    if (this.callbacks[event] !== undefined) {
      this.callbacks[event].forEach(function (callback) {
        callback.call(null, args);
      });
    }
  };
  sinon.stub(spy, 'on').and.callFake(function (event, callback) {
    if (spy.callbacks[event] === undefined) {
      spy.callbacks[event] = [];
    }
    spy.callbacks[event].push(callback);
  });
  return spy;
};

var moduleSpies = {};
var originalJsLoader = require.extensions['.js'];

sinon.stubModule = function sinon.stubModule(module) {
  var spy           = createSpy("spy on module \"" + module + "\"");
  spy.requireCount  = 0;
  return sinon.stubModuleAndReturn(module, spy);
};

sinon.stubModuleAndReturn = function sinon.stubModuleAndReturn(module, spy) {
  var path          = require.resolve(module);
  moduleSpies[path] = spy;
  delete require.cache[path];
  return spy;
};

require.extensions['.js'] = function (obj, path) {
  var spy = moduleSpies[path];
  if (spy) {
    spy.requireCount++;
    obj.exports = spy;
  } else {
    return originalJsLoader(obj, path);
  }
};

requireLib = function (modulePath) {
  return require('../../lib/' + modulePath);
};

beforeEach(function () {
  jasmine.addMatchers(require('./custom_matchers'));
});

afterEach(function () {
  for (var path in moduleSpies) {
    delete moduleSpies[path];
  }
});
