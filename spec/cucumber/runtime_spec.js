require('../support/spec_helper');

describe("Cucumber.Runtime", function () {
  var Cucumber = requireLib('cucumber');
  var configuration;
  var runtime;
  var isDryRunRequested, isFailFastRequested, isStrictRequested;

  beforeEach(function () {
    isStrictRequested = false;
    isDryRunRequested = false;
    isFailFastRequested = false;
    configuration = createStubbedObject({
      isDryRunRequested: isDryRunRequested,
      isFailFastRequested: isFailFastRequested,
      isStrictRequested: isStrictRequested,
      shouldFilterStackTraces: true
    });
    sinon.stub(Cucumber.Runtime.StackTraceFilter, 'filter');
    sinon.stub(Cucumber.Runtime.StackTraceFilter, 'unfilter');
    runtime       = Cucumber.Runtime(configuration);
  });

  describe("start()", function () {
    var features, supportCodeLibrary, callback, featuresRunner;

    beforeEach(function () {
      features           = createSpy("features (AST)");
      supportCodeLibrary = createSpy("support code library");
      featuresRunner      = createStubbedObject({run: null});
      callback           = createSpy("callback");
      sinon.stub(runtime, 'getFeatures').returns(features);
      sinon.stub(runtime, 'getSupportCodeLibrary').returns(supportCodeLibrary);
      sinon.stub(Cucumber.Runtime, 'FeaturesRunner').returns(featuresRunner);
    });

    it("fails when no callback is passed", function () {
      var exception;
      try { runtime.start(); } catch(err) { exception = err; }
      expect(exception).toBeDefined();
    });

    it("fails when the passed callback is not a function", function () {
      var exception;
      try { runtime.start("some string"); } catch(err) { exception = err; }
      expect(exception).toBeDefined();
    });

    it("gets the features", function () {
      runtime.start(callback);
      expect(runtime.getFeatures).to.have.been.called;
    });

    it("gets the support code library", function () {
      runtime.start(callback);
      expect(runtime.getSupportCodeLibrary).to.have.been.called;
    });

    it("creates a new features runner", function () {
      runtime.start(callback);
      var options = {
        dryRun: isDryRunRequested,
        failFast: isFailFastRequested,
        strict: isStrictRequested
      };
      expect(Cucumber.Runtime.FeaturesRunner).to.have.been.calledWith(features, supportCodeLibrary, [], options);
    });

    describe("when listeners are attached", function () {
      var listener;

      beforeEach(function () {
        listener = createSpy('listener');
        runtime.attachListener(listener);
      });

      it("passes the listener to the AST tree walker", function () {
        runtime.start(callback);
        var options = {
          dryRun: isDryRunRequested,
          failFast: isFailFastRequested,
          strict: isStrictRequested
        };
        expect(Cucumber.Runtime.FeaturesRunner).to.have.been.calledWith(features, supportCodeLibrary, [listener], options);
      });
    });

    describe("when stack traces should be filtered", function () {
      beforeEach(function () {
        configuration.shouldFilterStackTraces.returns(true);
      });

      it("activates the stack trace filter", function () {
        runtime.start(callback);
        expect(Cucumber.Runtime.StackTraceFilter.filter).to.have.been.called;
      });
    });

    describe("when stack traces should be unfiltered", function () {
      beforeEach(function () {
        configuration.shouldFilterStackTraces.returns(false);
      });

      it("does not activate the stack trace filter", function () {
        runtime.start(callback);
        expect(Cucumber.Runtime.StackTraceFilter.filter).not.to.have.been.called;
      });
    });

    it("tells the features runner to run", function () {
      runtime.start(callback);
      expect(featuresRunner.run).toHaveBeenCalledWithAFunctionAsNthParameter(1);
    });

    describe("when the features runner is done running", function () {
      var walkCallback, walkResults;

      beforeEach(function () {
        runtime.start(callback);
        walkCallback = featuresRunner.run.calls.mostRecent().args[0];
        walkResults = createSpy("AST tree walker results");
      });

      it("deactivates the stack trace filter", function () {
        walkCallback(walkResults);
        expect(Cucumber.Runtime.StackTraceFilter.unfilter).to.have.been.called;
      });

      it("calls back", function () {
        walkCallback(walkResults);
        expect(callback).to.have.been.calledWith(walkResults);
      });
    });
  });

  describe("getFeatures()", function () {
    var featureSources, astFilter, parser, features;

    beforeEach(function () {
      featureSources = createSpy("feature sources");
      astFilter      = createSpy("AST filter");
      features       = createSpy("features (AST)");
      parser         = createStubbedObject({parse: features});
      sinon.stubStub(configuration, 'getFeatureSources').returns(featureSources);
      sinon.stubStub(configuration, 'getAstFilter').returns(astFilter);
      sinon.stub(Cucumber, 'Parser').returns(parser);
    });

    it("gets the feature sources from the configuration", function () {
      runtime.getFeatures();
      expect(configuration.getFeatureSources).to.have.been.called;
    });

    it("gets the AST filter from the configuration", function () {
      runtime.getFeatures();
      expect(configuration.getAstFilter).to.have.been.called;
    });

    it("creates a new Cucumber parser for the feature sources", function () {
      runtime.getFeatures();
      expect(Cucumber.Parser).to.have.been.calledWith(featureSources, astFilter);
    });

    it("tells the parser to parse the features", function () {
      runtime.getFeatures();
      expect(parser.parse).to.have.been.called;
    });

    it("returns the parsed features", function () {
      expect(runtime.getFeatures()).to.equal(features);
    });
  });

  describe("getSupportCodeLibrary", function () {
    var supportCodeLibrary;

    beforeEach(function () {
      supportCodeLibrary = createSpy("support code library");
      sinon.stubStub(configuration, 'getSupportCodeLibrary').returns(supportCodeLibrary);
    });

    it("gets the support code library from the configuration", function () {
      runtime.getSupportCodeLibrary();
      expect(configuration.getSupportCodeLibrary).to.have.been.called;
    });

    it("returns the support code library", function () {
      expect(runtime.getSupportCodeLibrary()).to.equal(supportCodeLibrary);
    });
  });
});
