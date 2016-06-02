

describe("Cucumber.SupportCode.StepDefinitionSnippetBuilder", function () {
  var Cucumber                     = requireLib('cucumber');
  var snippetBuilder, step, syntax;

  beforeEach(function () {
    step           = createSpy("step");
    syntax         = createStubbedObject({build: null});
    snippetBuilder = Cucumber.SupportCode.StepDefinitionSnippetBuilder(step, syntax);
  });

  describe("buildSnippet()", function () {
    var functionName, pattern, parameters, snippet;

    beforeEach(function () {
      functionName   = "defineSomeStep";
      pattern        = "/^some step pattern$/";
      parameters     = ['some', 'parameters', 'and', 'the', 'callback'];
      snippet        = 'snippet';
      sinon.stub(snippetBuilder, 'buildStepDefinitionFunctionName').returns(functionName);
      sinon.stub(snippetBuilder, 'buildStepDefinitionPattern').returns(pattern);
      sinon.stub(snippetBuilder, 'buildStepDefinitionParameters').returns(parameters);
      syntax.build.returns(snippet);
    });

    it("builds the step definition's function name", function () {
      snippetBuilder.buildSnippet();
      expect(snippetBuilder.buildStepDefinitionFunctionName).to.have.been.called;
    });

    it("builds the step definition's pattern", function () {
      snippetBuilder.buildSnippet();
      expect(snippetBuilder.buildStepDefinitionPattern).to.have.been.called;
    });

    it("builds the step definition's parameters", function () {
      snippetBuilder.buildSnippet();
      expect(snippetBuilder.buildStepDefinitionParameters).to.have.been.called;
    });

    it("builds the snippet in the given syntax", function () {
      snippetBuilder.buildSnippet();
      expect(syntax.build).to.have.been.calledWith(functionName, pattern, parameters, jasmine.any(String));
    });

    it("returns the snippet", function () {
      expect(snippetBuilder.buildSnippet()).to.equal(snippet);
    });
  });

  describe("buildStepDefinitionFunctionName()", function () {
    beforeEach(function () {
      sinon.stubStub(step, 'isOutcomeStep');
      sinon.stubStub(step, 'isEventStep');
    });

    it("checks whether the step is a context step", function () {
      snippetBuilder.buildStepDefinitionFunctionName();
      expect(step.isOutcomeStep).to.have.been.called;
    });

    describe("when the step is a context step", function () {
      beforeEach(function () {
        step.isOutcomeStep.returns(true);
      });

      it("returns the outcome step definition function name", function () {
        expect(snippetBuilder.buildStepDefinitionFunctionName()).to.equal("Then");
      });
    });

    describe("when the step is not a context step", function () {
      beforeEach(function () {
        step.isOutcomeStep.returns(false);
      });

      it("checks whether the step is an event step", function () {
        snippetBuilder.buildStepDefinitionFunctionName();
        expect(step.isEventStep).to.have.been.called;
      });

      describe("when the step is an event step", function () {
        beforeEach(function () {
          step.isEventStep.returns(true);
        });

        it("returns the event step definition function name", function () {
          expect(snippetBuilder.buildStepDefinitionFunctionName()).to.equal("When");
        });
      });

      describe("when the step is not an event step", function () {
        beforeEach(function () {
          step.isEventStep.returns(false);
        });

        it("returns the context step definition function name", function () {
          expect(snippetBuilder.buildStepDefinitionFunctionName()).to.equal("Given");
        });
      });
    });
  });

  describe("buildStepDefinitionPattern()", function () {
    var stepName, escapedStepName, parameterizedStepName;

    beforeEach(function () {
      parameterizedStepName = "step name-" + (Math.random()*10);
      escapedStepName = createSpy("escaped step name");
      stepName        = createSpy("step name");
      sinon.stubStub(step, 'getName').returns(stepName);
      sinon.stubStub(step, 'isOutlineStep');
      sinon.stubStub(Cucumber.Util.RegExp, 'escapeString').returns(escapedStepName);
      sinon.stub(snippetBuilder, 'parameterizeStepName').returns(parameterizedStepName);
    });

    it("gets the step name", function () {
      snippetBuilder.buildStepDefinitionPattern();
      expect(step.getName).to.have.been.called;
    });

    it("escapes the step name for use as a regexp", function () {
      snippetBuilder.buildStepDefinitionPattern();
      expect(Cucumber.Util.RegExp.escapeString).to.have.been.calledWith(stepName);
    });

    it("parameterizes the step name", function () {
      snippetBuilder.buildStepDefinitionPattern();
      expect(snippetBuilder.parameterizeStepName).to.have.been.calledWith(escapedStepName);
    });

    it("returns the step name within a full line-matching regexp", function () {
      var pattern = snippetBuilder.buildStepDefinitionPattern();
      expect(pattern).to.equal('/^' + parameterizedStepName + '$/');
    });
  });

  describe("parameterizeStepName()", function () {
    var stepName, parameterizedNumbersStepName, parameterizedStepName;

    beforeEach(function () {
      parameterizedStepName        = createSpy("parameterized step name");
      parameterizedNumbersStepName = createStubbedObject({replace: parameterizedStepName});
      stepName                     = createStubbedObject({replace: parameterizedNumbersStepName});
    });

    it("replaces numbers with matching groups", function () {
      snippetBuilder.parameterizeStepName(stepName);
      expect(stepName.replace).to.have.been.called;
      expect(stepName.replace).toHaveBeenCalledWithRegExpAsNthParameter(/\d+/gi, 1);
      expect(stepName.replace).toHaveBeenCalledWithValueAsNthParameter('(\\d+)', 2);
    });

    it("replaces quoted strings with matching groups", function () {
      snippetBuilder.parameterizeStepName(stepName);
      expect(parameterizedNumbersStepName.replace).to.have.been.called;
      expect(parameterizedNumbersStepName.replace).toHaveBeenCalledWithRegExpAsNthParameter(/"[^"]*"/gi, 1);
      expect(parameterizedNumbersStepName.replace).toHaveBeenCalledWithValueAsNthParameter('"([^"]*)"', 2);
    });

    it("returns the parameterized step name", function () {
      expect(snippetBuilder.parameterizeStepName(stepName)).to.equal(parameterizedStepName);
    });
  });

  describe("buildStepDefinitionParameters()", function () {
    var patternMatchingGroupParameters;

    beforeEach(function () {
      patternMatchingGroupParameters = ['some', 'stepdef', 'parameters'];
      sinon.stub(snippetBuilder, 'getStepDefinitionPatternMatchingGroupParameters').returns(patternMatchingGroupParameters);
      sinon.stubStub(step, 'getArguments').returns([]);
    });

    it("gets the step definition pattern matching group parameters", function () {
      snippetBuilder.buildStepDefinitionParameters();
      expect(snippetBuilder.getStepDefinitionPatternMatchingGroupParameters).to.have.been.called;
    });

    it("returns the parameters and a callback joined", function () {
      var parameters = patternMatchingGroupParameters.concat(['callback']);
      expect(snippetBuilder.buildStepDefinitionParameters()).to.eql(parameters);
    });

    describe("when there is a doc string", function () {
      it("returns the parameters, an additional 'string' parameter and a callback joined", function () {
        var docStringArgument = createStubbedObject('doc string', {getType: 'DocString'});
        step.getArguments.returns([docStringArgument]);
        var parameters = patternMatchingGroupParameters.concat(['string', 'callback']);
        expect(snippetBuilder.buildStepDefinitionParameters()).to.eql(parameters);
      });
    });

    describe("when there is a data table", function () {
      it("returns the parameters, an additional 'table' parameter and a callback joined", function () {
        var dataTableArgument = createStubbedObject('data table', {getType: 'DataTable'});
        step.getArguments.returns([dataTableArgument]);
        var parameters = patternMatchingGroupParameters.concat(['table', 'callback']);
        expect(snippetBuilder.buildStepDefinitionParameters()).to.eql(parameters);
      });
    });
  });

  describe("getStepDefinitionPatternMatchingGroupParameters()", function () {
    beforeEach(function () {
      sinon.stub(snippetBuilder, 'countStepDefinitionPatternMatchingGroups');
      sinon.stubStub(step, 'isOutlineStep');
      sinon.stubStub(step, 'getName');
      step.getName.returns('stepName');
    });

    it("gets the number of step definition pattern matching groups", function () {
      snippetBuilder.countStepDefinitionPatternMatchingGroups.returns(0);
      snippetBuilder.getStepDefinitionPatternMatchingGroupParameters();
      expect(snippetBuilder.countStepDefinitionPatternMatchingGroups).to.have.been.called;
    });

    it("returns an empty array when there are no matching groups", function () {
      snippetBuilder.countStepDefinitionPatternMatchingGroups.returns(0);
      var parameters = snippetBuilder.getStepDefinitionPatternMatchingGroupParameters();
      expect(parameters).to.eql([]);
    });

    it("returns one parameter when there is one matching group", function () {
      snippetBuilder.countStepDefinitionPatternMatchingGroups.returns(1);
      var parameters = snippetBuilder.getStepDefinitionPatternMatchingGroupParameters();
      expect(parameters).to.eql(['arg1']);
    });

    it("returns two joined parameters when there are two matching groups", function () {
      snippetBuilder.countStepDefinitionPatternMatchingGroups.returns(2);
      var parameters = snippetBuilder.getStepDefinitionPatternMatchingGroupParameters();
      expect(parameters).to.eql(['arg1', 'arg2']);
    });
  });

  describe("countStepDefinitionPatternMatchingGroups()", function () {
    var stepDefinitionPattern, numberCount, stringCount, count;

    beforeEach(function () {
      numberCount = Math.floor(Math.random() * 10);
      stringCount = Math.floor(Math.random() * 10);
      count       = numberCount + stringCount;
      stepDefinitionPattern = createSpy("step definition pattern");
      sinon.stub(snippetBuilder, 'buildStepDefinitionPattern').returns(stepDefinitionPattern);
      sinon.stub(Cucumber.Util.String, 'count').and.returnValues.apply(null, [numberCount, stringCount]);
    });

    it("builds the step definition pattern", function () {
      snippetBuilder.countStepDefinitionPatternMatchingGroups();
      expect(snippetBuilder.buildStepDefinitionPattern).to.have.been.called;
    });

    it("counts the number matching groups inside the pattern", function () {
      snippetBuilder.countStepDefinitionPatternMatchingGroups();
      expect(Cucumber.Util.String.count).to.have.been.calledWith(stepDefinitionPattern, '(\\d+)');
    });

    it("counts the quoted string matching groups inside the pattern", function () {
      snippetBuilder.countStepDefinitionPatternMatchingGroups();
      expect(Cucumber.Util.String.count).to.have.been.calledWith(stepDefinitionPattern, '"([^"]*)"');
    });

    it("returns the sum of both counts", function () {
      expect(snippetBuilder.countStepDefinitionPatternMatchingGroups()).to.equal(count);
    });
  });
});
