

describe("Cucumber.Listener.PrettyFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var path     = require('path');
  var colors   = require('colors/safe');
  colors.enabled = true;
  var formatter, formatterHearMethod, summaryFormatter, prettyFormatter, options, logged;

  beforeEach(function () {
    options             = {useColors: true};
    formatter           = createStubbedObject({finish: null});
    logged              = '';
    sinon.stubStub(formatter, 'log').and.callFake(function (text) { logged += text; });
    formatterHearMethod = sinon.stubStub(formatter, 'hear');
    summaryFormatter    = createSpy("summary formatter");
    sinon.stub(Cucumber.Listener, 'Formatter').returns(formatter);
    sinon.stub(Cucumber.Listener, 'SummaryFormatter').returns(summaryFormatter);
    prettyFormatter = Cucumber.Listener.PrettyFormatter(options);
  });

  describe("constructor", function () {
    it("creates a formatter", function () {
      expect(Cucumber.Listener.Formatter).to.have.been.calledWith(options);
    });

    it("extends the formatter", function () {
      expect(prettyFormatter).to.equal(formatter);
    });

    it("creates a summaryFormatter", function () {
      expect(Cucumber.Listener.SummaryFormatter).to.have.been.called;
    });
  });

  describe("hear()", function () {
    var event, callback;

    beforeEach(function () {
      event    = createSpy("event");
      callback = createSpy("callback");
      sinon.stubStub(summaryFormatter, 'hear');
    });

    it("tells the summary formatter to listen to the event", function () {
      prettyFormatter.hear(event, callback);
      expect(summaryFormatter.hear).to.have.been.called;
      expect(summaryFormatter.hear).toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(summaryFormatter.hear).toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("summary formatter callback", function () {
      var summaryFormatterCallback;

      beforeEach(function () {
        prettyFormatter.hear(event, callback);
        summaryFormatterCallback = summaryFormatter.hear.calls.mostRecent().args[1];
      });

      it("tells the formatter to listen to the event", function () {
        summaryFormatterCallback();
        expect(formatterHearMethod).to.have.been.calledWith(event, callback);
      });
    });
  });

  describe("handleBeforeFeatureEvent()", function () {
    var event, feature, callback;

    beforeEach(function () {
      feature = createStubbedObject({
        getKeyword: "feature-keyword",
        getName: "feature-name",
        getDescription: '',
        getTags: []
      });
      event = createStubbedObject({ getPayloadItem: feature });
      callback = createSpy("callback");
    });

    describe('no tags or description', function () {
      beforeEach(function (){
        prettyFormatter.handleBeforeFeatureEvent(event, callback);
      });

      it('logs the keyword and name', function () {
        expect(logged).to.eql('feature-keyword: feature-name\n\n');
      });

      it("calls back", function () {
        expect(callback).to.have.been.called;
      });
    });

    describe('with tags', function () {
      beforeEach(function (){
        feature.getTags.returns([
          createStubbedObject({getName: '@tag1'}),
          createStubbedObject({getName: '@tag2'})
        ]);
        prettyFormatter.handleBeforeFeatureEvent(event, callback);
      });

      it('logs the keyword and name', function () {
        var expected =
          colors.cyan('@tag1 @tag2') + '\n' +
          'feature-keyword: feature-name' + '\n\n';
        expect(logged).to.eql(expected);
      });
    });

    describe('with feature description', function () {
      beforeEach(function (){
        feature.getDescription.returns('line1\nline2');
        prettyFormatter.handleBeforeFeatureEvent(event, callback);
      });

      it('logs the keyword and name', function () {
        var expected =
          'feature-keyword: feature-name' + '\n\n' +
          '  line1' + '\n' +
          '  line2' + '\n\n';

        expect(logged).to.eql(expected);
      });
    });
  });

  describe("handleBeforeScenarioEvent()", function () {
    var event, scenario, callback;

    beforeEach(function () {
      scenario = createStubbedObject({
        getKeyword: "scenario-keyword",
        getName: "scenario-name",
        getUri: path.join(process.cwd(), "scenario-uri"),
        getLine: 1,
        getBackground: undefined,
        getTags: [],
        getSteps: []
      });
      event = createStubbedObject({ getPayloadItem: scenario });
      callback = createSpy("callback");
    });

    describe('no tags', function () {
      beforeEach(function (){
        prettyFormatter.handleBeforeScenarioEvent(event, callback);
      });

      it('logs the keyword and name', function () {
        expect(logged).to.eql('  scenario-keyword: scenario-name\n');
      });

      it("calls back", function () {
        expect(callback).to.have.been.called;
      });
    });

    describe('with tags', function () {
      beforeEach(function (){
        scenario.getTags.returns([
          createStubbedObject({getName: '@tag1'}),
          createStubbedObject({getName: '@tag2'})
        ]);
        prettyFormatter.handleBeforeScenarioEvent(event, callback);
      });

      it('logs the keyword and name', function () {
        var expected =
          '  ' + colors.cyan('@tag1 @tag2') + '\n' +
          '  scenario-keyword: scenario-name' + '\n';
        expect(logged).to.eql(expected);
      });
    });
  });

  describe("handleAfterScenarioEvent()", function () {
    var event, callback;

    beforeEach(function () {
      event    = createSpy("event");
      callback = createSpy("callback");
    });

    it("logs a new line", function () {
      prettyFormatter.handleAfterScenarioEvent(event, callback);
      expect(prettyFormatter.log).to.have.been.calledWith("\n");
    });

    it("calls back", function () {
      prettyFormatter.handleAfterScenarioEvent(event, callback);
      expect(callback).to.have.been.called;
    });
  });

  describe("handleStepResultEvent()", function () {
    var step, stepResult, event, callback;

    beforeEach(function () {
      step       = createStubbedObject({ isHidden: null });
      stepResult = createStubbedObject({ getStep: step, getStatus: undefined });
      event      = createStubbedObject({ getPayloadItem: stepResult });
      callback   = createSpy("callback");
      sinon.stubStub(prettyFormatter, 'logStepResult');
    });

    it("gets the step result from the event payload", function () {
      prettyFormatter.handleStepResultEvent(event, callback);
      expect(event.getPayloadItem).to.have.been.calledWith('stepResult');
    });

    describe("when step result is not hidden", function () {
      it("calls logStepResult() as the step is not hidden", function () {
        step.isHidden.returns(false);
        prettyFormatter.handleStepResultEvent(event, callback);
        expect(prettyFormatter.logStepResult).to.have.been.calledWith(step, stepResult);
      });
    });

    describe("when step result is hidden", function () {
      it("does not call logStepResult() to keep the step hidden", function () {
        step.isHidden.returns(true);
        stepResult.getStatus.returns(Cucumber.Status.PASSED);
        prettyFormatter.handleStepResultEvent(event, callback);
        expect(prettyFormatter.logStepResult).not.to.have.been.called;
      });
    });

    it("calls back", function () {
      prettyFormatter.handleStepResultEvent(event, callback);
      expect(callback).to.have.been.called;
    });
  });

  describe("logStepResult()", function () {
    var stepResult, step, stepDefinition;

    beforeEach(function () {
      stepDefinition = createStubbedObject({
        getLine: 1,
        getUri: path.join(process.cwd(), 'step-definition-uri')
      });
      step = createStubbedObject({
        getArguments: [],
        getLine: 1,
        getKeyword: "step-keyword ",
        getName: "step-name",
        getUri: path.join(process.cwd(), "step-uri"),
        hasUri: true
      });
      stepResult = createStubbedObject({
        getFailureException: null,
        getStep: step,
        getStepDefinition: stepDefinition,
        getStatus: Cucumber.Status.PASSED
      });
    });

    describe("passing step", function () {
      beforeEach(function () {
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword and name', function () {
        var expected =
          '    ' + colors.green('step-keyword step-name') + '\n';
        expect(logged).to.eql(expected);
      });
    });

    describe("pending step", function () {
      beforeEach(function () {
        stepResult.getStatus.returns(Cucumber.Status.PENDING);
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword and name', function () {
        var expected =
          '    ' + colors.yellow('step-keyword step-name') + '\n';
        expect(logged).to.eql(expected);
      });
    });

    describe("skipped step", function () {
      beforeEach(function () {
        stepResult.getStatus.returns(Cucumber.Status.SKIPPED);
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword and name', function () {
        var expected =
          '    ' + colors.cyan('step-keyword step-name') + '\n';
        expect(logged).to.eql(expected);
      });
    });

    describe("undefined step", function () {
      beforeEach(function () {
        stepResult.getStatus.returns(Cucumber.Status.UNDEFINED);
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword and name', function () {
        var expected =
          '    ' + colors.yellow('step-keyword step-name') + '\n';
        expect(logged).to.eql(expected);
      });
    });

    describe("failed step", function () {
      beforeEach(function () {
        stepResult.getStatus.returns(Cucumber.Status.FAILED);
        stepResult.getFailureException.returns({stack: 'stack error\n  stacktrace1\n  stacktrace2'});
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword and name', function () {
        var expected =
          '    ' + colors.red('step-keyword step-name') + '\n';
        expect(logged).to.eql(expected);
      });
    });

    describe("without name", function () {
      beforeEach(function () {
        step.getName.returns(undefined);
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword', function () {
        var expected =
          '    step-keyword ' + '\n';
        expect(colors.strip(logged)).to.eql(expected);
      });
    });

    describe("with data table", function () {
      beforeEach(function() {
        var rows = [
          ["cuk", "cuke", "cukejs"],
          ["c",   "cuke", "cuke.js"],
          ["cu",  "cuke", "cucumber"]
        ];
        var dataTable = createStubbedObject({getType: 'DataTable', raw: rows});
        step.getArguments.returns([dataTable]);
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword and name and data table', function () {
        var expected =
          '    step-keyword step-name' + '\n' +
          '      | cuk | cuke | cukejs   |' + '\n' +
          '      | c   | cuke | cuke.js  |' + '\n' +
          '      | cu  | cuke | cucumber |' + '\n';
        expect(colors.strip(logged)).to.eql(expected);
      });
    });

    describe("with doc string", function () {
      beforeEach(function () {
        var content = "this is a multiline\ndoc string\n\n:-)";
        var docString = createStubbedObject({getType: 'DocString', getContent: content});
        step.getArguments.returns([docString]);
        prettyFormatter.logStepResult(step, stepResult);
      });

      it('logs the keyword and name and doc string', function () {
        var expected =
          '    step-keyword step-name' + '\n' +
          '      """' + '\n' +
          '      this is a multiline' + '\n' +
          '      doc string' + '\n' +
          '\n' +
          '      :-)' + '\n' +
          '      """' + '\n';
        expect(colors.strip(logged)).to.eql(expected);
      });
    });
  });

  describe("handleAfterFeaturesEvent()", function () {
    var event, callback, summary;

    beforeEach(function () {
      event    = createSpy("event");
      callback = createSpy("callback");
      summary  = createSpy("summary logs");
      sinon.stubStub(summaryFormatter, 'getLogs').returns(summary);
    });

    it("gets the summary from the summaryFormatter", function () {
      prettyFormatter.handleAfterFeaturesEvent(event, callback);
      expect(summaryFormatter.getLogs).to.have.been.called;
    });

    it("logs the summary", function () {
      prettyFormatter.handleAfterFeaturesEvent(event, callback);
      expect(prettyFormatter.log).to.have.been.calledWith(summary);
    });

    it("calls finish with the callback", function () {
      prettyFormatter.handleAfterFeaturesEvent(event, callback);
      expect(prettyFormatter.finish).to.have.been.calledWith(callback);
    });
  });

  describe("logIndented()", function () {
    var text, level, indented;

    beforeEach(function () {
      text     = createSpy("text");
      level    = createSpy("level");
      indented = createSpy("indented text");
      sinon.stub(prettyFormatter, 'indent').returns(indented);
    });

    it("indents the text", function () {
      prettyFormatter.logIndented(text, level);
      expect(prettyFormatter.indent).to.have.been.calledWith(text, level);
    });

    it("logs the indented text", function () {
      prettyFormatter.logIndented(text, level);
      expect(prettyFormatter.log).to.have.been.calledWith(indented);
    });
  });

  describe("indent()", function () {
    it("returns the original text on a 0-indentation level", function () {
      var original = "cuke\njavascript";
      var expected = original;
      var actual   = prettyFormatter.indent(original, 0);
      expect(actual).to.eql(expected);
    });

    it("returns the 1-level indented text", function () {
      var original = "cuke\njavascript";
      var expected = "  cuke\n  javascript";
      var actual   = prettyFormatter.indent(original, 1);
      expect(actual).to.eql(expected);
    });

    it("returns the 2-level indented text", function () {
      var original = "cuke\njavascript";
      var expected = "    cuke\n    javascript";
      var actual   = prettyFormatter.indent(original, 2);
      expect(actual).to.eql(expected);
    });

    it("returns the 3-level indented text", function () {
      var original = "cuke\njavascript";
      var expected = "      cuke\n      javascript";
      var actual   = prettyFormatter.indent(original, 3);
      expect(actual).to.eql(expected);
    });
  });
});
