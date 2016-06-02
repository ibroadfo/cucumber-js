

describe("Cucumber.Cli.SupportCodeLoader", function () {
  var Cucumber = requireLib('cucumber');
  var fs       = require('fs');

  var supportCodeLoader, supportCodeFilePaths, primeSupportCodeFilePaths, secondarySupportCodeFilePaths;
  var supportCodeInitializer, supportCodeLibrary;

  beforeEach(function () {
    supportCodeFilePaths          = [createStubbedObject("first secondary support code file path",  {match: false}),
                                     createStubbedObject("first prime support code file path",      {match: true}),
                                     createStubbedObject("second prime support code file path",     {match: true}),
                                     createStubbedObject({match: false})];
    primeSupportCodeFilePaths     = [supportCodeFilePaths[1], supportCodeFilePaths[2]];
    secondarySupportCodeFilePaths = [supportCodeFilePaths[0], supportCodeFilePaths[3]];
    supportCodeLoader             = Cucumber.Cli.SupportCodeLoader(supportCodeFilePaths, []);
  });

  describe("getSupportCodeLibrary()", function () {
    beforeEach(function () {
      supportCodeInitializer  = createSpy("support code initializer function");
      supportCodeLibrary      = createSpy("support code library");
      sinon.stub(supportCodeLoader, 'getSupportCodeInitializer').returns(supportCodeInitializer);
      sinon.stub(Cucumber.SupportCode, 'Library').returns(supportCodeLibrary);
    });

    it("gets the support code initializer function", function () {
      supportCodeLoader.getSupportCodeLibrary();
      expect(supportCodeLoader.getSupportCodeInitializer).to.have.been.called;
    });

    it("creates a new support code library with the initializer", function () {
      supportCodeLoader.getSupportCodeLibrary();
      expect(Cucumber.SupportCode.Library).to.have.been.calledWith(supportCodeInitializer);
    });

    it("returns the support code library", function () {
      expect(supportCodeLoader.getSupportCodeLibrary()).to.equal(supportCodeLibrary);
    });
  });

  describe("getSupportCodeInitializer()", function () {
    var primeSupportCodeInitializer, secondarySupportCodeInitializer;

    beforeEach(function () {
      primeSupportCodeInitializer     = createSpy("prime support code initializer");
      secondarySupportCodeInitializer = createSpy("secondary support code initializer");
      sinon.stub(supportCodeLoader, 'getPrimeSupportCodeInitializer').returns(primeSupportCodeInitializer);
      sinon.stub(supportCodeLoader, 'getSecondarySupportCodeInitializer').returns(secondarySupportCodeInitializer);
    });

    it("gets the prime support code", function () {
      supportCodeLoader.getSupportCodeInitializer();
      expect(supportCodeLoader.getPrimeSupportCodeInitializer).to.have.been.called;
    });

    it("gets the secondary support code", function () {
      supportCodeLoader.getSupportCodeInitializer();
      expect(supportCodeLoader.getSecondarySupportCodeInitializer).to.have.been.called;
    });

    it("returns a function", function () {
      expect(supportCodeLoader.getSupportCodeInitializer()).toBeAFunction ();
    });

    describe("returned function", function () {
      var initializerFunction, supportCodeHelper;

      beforeEach(function () {
        initializerFunction = supportCodeLoader.getSupportCodeInitializer();
        supportCodeHelper   = createSpy("support code helper");
      });

      it("calls the prime support code", function () {
        initializerFunction.call(supportCodeHelper);
        expect(primeSupportCodeInitializer).to.have.been.called;
      });

      it("calls the prime support code with the support code helper as 'this'", function () {
        initializerFunction.call(supportCodeHelper);
        expect(primeSupportCodeInitializer.calls.mostRecent().object).to.equal(supportCodeHelper);
      });

      it("calls the secondary support code", function () {
        initializerFunction.call(supportCodeHelper);
        expect(secondarySupportCodeInitializer).to.have.been.called;
      });

      it("calls the secondary support code with the support code helper as 'this'", function () {
        initializerFunction.call(supportCodeHelper);
        expect(secondarySupportCodeInitializer.calls.mostRecent().object).to.equal(supportCodeHelper);
      });
    });
  });

  describe("getPrimeSupportCodeInitializer()", function () {
    var primeSupportCodeInitializer;

    beforeEach(function () {
      primeSupportCodeInitializer = createSpy("prime support code initializer");
      sinon.stub(supportCodeLoader, 'getPrimeSupportCodeFilePaths').returns(primeSupportCodeFilePaths);
      sinon.stub(supportCodeLoader, 'buildSupportCodeInitializerFromPaths').returns(primeSupportCodeInitializer);
    });

    it("gets the prime support code file paths", function () {
      supportCodeLoader.getPrimeSupportCodeInitializer();
      expect(supportCodeLoader.getPrimeSupportCodeFilePaths).to.have.been.called;
    });

    it("builds the support code initializer from the paths", function () {
      supportCodeLoader.getPrimeSupportCodeInitializer();
      expect(supportCodeLoader.buildSupportCodeInitializerFromPaths).to.have.been.calledWith(primeSupportCodeFilePaths);
    });

    it("returns the support code initializer built from the paths", function () {
      expect(supportCodeLoader.getPrimeSupportCodeInitializer()).to.equal(primeSupportCodeInitializer);
    });
  });

  describe("getPrimeSupportCodeFilePaths()", function () {
    it("for each support code file path, checks whether they match the prime support code directory name convention", function () {
      supportCodeLoader.getPrimeSupportCodeFilePaths();
      supportCodeFilePaths.forEach(function (path) {
        expect(path.match).to.have.been.calledWith(Cucumber.Cli.SupportCodeLoader.PRIME_SUPPORT_CODE_PATH_REGEXP);
      });
    });

    it("returns the paths that matched the prime support code directory name convention", function () {
      expect(supportCodeLoader.getPrimeSupportCodeFilePaths()).to.eql(primeSupportCodeFilePaths);
    });
  });

  describe("getSecondarySupportCodeInitializer()", function () {
    var secondarySupportCodeInitializer;

    beforeEach(function () {
      secondarySupportCodeInitializer = createSpy("secondary support code initializer");
      sinon.stub(supportCodeLoader, 'getSecondarySupportCodeFilePaths').returns(secondarySupportCodeFilePaths);
      sinon.stub(supportCodeLoader, 'buildSupportCodeInitializerFromPaths').returns(secondarySupportCodeInitializer);
    });

    it("gets the secondary support code file paths", function () {
      supportCodeLoader.getSecondarySupportCodeInitializer();
      expect(supportCodeLoader.getSecondarySupportCodeFilePaths).to.have.been.called;
    });

    it("builds the support code initializer from the paths", function () {
      supportCodeLoader.getSecondarySupportCodeInitializer();
      expect(supportCodeLoader.buildSupportCodeInitializerFromPaths).to.have.been.calledWith(secondarySupportCodeFilePaths);
    });

    it("returns the support code initializer built from the paths", function () {
      expect(supportCodeLoader.getSecondarySupportCodeInitializer()).to.equal(secondarySupportCodeInitializer);
    });
  });

  describe("getSecondarySupportCodeFilePaths()", function () {
    it("for each support code file path, checks whether they match the prime support code directory name convention", function () {
      supportCodeLoader.getSecondarySupportCodeFilePaths();
      supportCodeFilePaths.forEach(function (path) {
        expect(path.match).to.have.been.calledWith(Cucumber.Cli.SupportCodeLoader.PRIME_SUPPORT_CODE_PATH_REGEXP);
      });
    });

    it("returns the paths that did not match the prime support code directory name convention", function () {
      expect(supportCodeLoader.getSecondarySupportCodeFilePaths()).to.eql(secondarySupportCodeFilePaths);
    });
  });

  describe("buildSupportCodeInitializerFromPaths()", function () {
    var paths;

    beforeEach(function () {
      paths = [
        fs.realpathSync(__dirname + "/../../support/initializer_stub1.js"),
        fs.realpathSync(__dirname + "/../../support/initializer_stub2.js"),
        fs.realpathSync(__dirname + "/../../support/initializer_stub3.js")
      ];
    });

    it("returns a function that wraps the initializers", function () {
      expect(supportCodeLoader.buildSupportCodeInitializerFromPaths(paths)).toBeAFunction ();
    });

    describe("returned wrapper function", function () {
      var initializers, returnedWrapperFunction, supportCodeHelper;
      var nonInitializerSupportCode, nonInitializerSupportCodeCalled;

      beforeEach(function () {
        nonInitializerSupportCode = { call: function () { nonInitializerSupportCodeCalled = true; } };
        nonInitializerSupportCodeCalled = false;
        initializers = [
          sinon.stubModule(paths[0]),
          sinon.stubModule(paths[1])
        ];
        sinon.stubModuleAndReturn(paths[2], nonInitializerSupportCode);
        returnedWrapperFunction = supportCodeLoader.buildSupportCodeInitializerFromPaths(paths);
        supportCodeHelper       = createSpy("support code helper");
      });

      it("requires each initializer", function () {
        returnedWrapperFunction.call(supportCodeHelper);
        initializers.forEach(function (initializer) {
          expect(initializer).toHaveBeenRequired();
        });
      });

      it("calls each initializer function", function () {
        returnedWrapperFunction.call(supportCodeHelper);
        initializers.forEach(function (initializer) {
          expect(initializer).to.have.been.called;
        });
      });

      it("does not call non-functions (non-initializer support code)", function () {
        returnedWrapperFunction.call(supportCodeHelper);
        expect(nonInitializerSupportCodeCalled).not.to.be.ok;
      });

      it("calls each initializer function with the support code helper as 'this'", function () {
        returnedWrapperFunction.call(supportCodeHelper);
        initializers.forEach(function (initializer) {
          expect(initializer.calls.mostRecent().object).to.equal(supportCodeHelper);
        });
      });
    });
  });
});
