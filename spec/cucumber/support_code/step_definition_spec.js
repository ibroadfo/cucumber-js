

describe("Cucumber.SupportCode.StepDefinition", function () {
  var Cucumber = requireLib('cucumber');
  var stepDefinition, pattern, stepDefinitionCode;

  beforeEach(function () {
    pattern            = createStubbedObject({test: null});
    stepDefinitionCode = createSpy("step definition code");
    sinon.stub(global, 'RegExp');
    stepDefinition = Cucumber.SupportCode.StepDefinition(pattern, {}, stepDefinitionCode);
  });

  describe("getPatternRegexp()", function () {
    describe("when the pattern is a RegExp", function () {
      it("does not instantiate a RegExp", function () {
        expect(global.RegExp).not.to.have.been.called;
      });

      it("returns the pattern itself", function () {
        expect(stepDefinition.getPatternRegexp()).to.equal(pattern);
      });
    });

    describe("when the pattern is a String", function () {
      var regexp, quotedDollarParameterSubstitutedPattern, safeString, regexpString;

      beforeEach(function () {
        regexp                                  = createSpy("regexp");
        regexpString                            = "regexp string";
        safeString                              = createStubbedObject("safe string");
        quotedDollarParameterSubstitutedPattern = createStubbedObject({replace: regexpString});
        sinon.stubStub(pattern, 'replace').returns(safeString);
        sinon.stubStub(safeString, 'replace').returns(quotedDollarParameterSubstitutedPattern);
        global.RegExp.returns(regexp);
      });

      it("escapes unsafe regexp characters from the string", function () {
        stepDefinition.getPatternRegexp();
        expect(pattern.replace).to.have.been.calledWith(Cucumber.SupportCode.StepDefinition.UNSAFE_STRING_CHARACTERS_REGEXP, Cucumber.SupportCode.StepDefinition.PREVIOUS_REGEXP_MATCH);
      });

      it("replaces quoted dollar-prefixed parameters with the regexp equivalent", function () {
        stepDefinition.getPatternRegexp();
        expect(safeString.replace).to.have.been.calledWith(Cucumber.SupportCode.StepDefinition.QUOTED_DOLLAR_PARAMETER_REGEXP, Cucumber.SupportCode.StepDefinition.QUOTED_DOLLAR_PARAMETER_SUBSTITUTION);
      });

      it("replaces other dollar-prefixed parameter with the regexp equivalent", function () {
        stepDefinition.getPatternRegexp();
        expect(quotedDollarParameterSubstitutedPattern.replace).to.have.been.calledWith(Cucumber.SupportCode.StepDefinition.DOLLAR_PARAMETER_REGEXP, Cucumber.SupportCode.StepDefinition.DOLLAR_PARAMETER_SUBSTITUTION);
      });

      it("instantiates a new RegExp", function () {
        stepDefinition.getPatternRegexp();
        expect(global.RegExp).to.have.been.calledWith("^" + regexpString + "$");
      });

      it("returns the new RegExp", function () {
        expect(stepDefinition.getPatternRegexp()).to.equal(regexp);
      });
    });
  });

  describe("matchesStepName()", function () {
    var patternRegexp, stepName, matchResult;

    beforeEach(function () {
      stepName      = createSpy("step name");
      matchResult   = createSpy("step match result (boolean)");
      patternRegexp = createStubbedObject({test: matchResult});
      sinon.stub(stepDefinition, 'getPatternRegexp').returns(patternRegexp);
    });

    it("gets the pattern regexp", function () {
      stepDefinition.matchesStepName(stepName);
      expect(stepDefinition.getPatternRegexp).to.have.been.called;
    });

    it("tests the string against the step name", function () {
      stepDefinition.matchesStepName(stepName);
      expect(patternRegexp.test).to.have.been.calledWith(stepName);
    });

    it("returns the match result", function () {
      expect(stepDefinition.matchesStepName(stepName)).to.equal(matchResult);
    });
  });

  describe("invoke()", function () {
    var step, world, scenario, defaultTimeout, callback, parameters;

    beforeEach(function () {
      step = createSpy("step");
      world = createSpy("world");
      scenario = createStubbedObject({getAttachments: undefined});
      defaultTimeout = 5 * 1000;
      callback = createSpy("callback");
      parameters = createSpy("code execution parameters");
      sinon.stub(Cucumber.Util, 'run');
      sinon.stub(stepDefinition, 'buildInvocationParameters').returns(parameters);
      stepDefinition.invoke(step, world, scenario, defaultTimeout, callback);
    });

    it("builds the step invocation parameters", function () {
      expect(stepDefinition.buildInvocationParameters).to.have.been.calledWith(step, scenario);
    });

    it("runs the function", function () {
      expect(Cucumber.Util.run).to.have.been.calledWith(stepDefinitionCode, world, parameters, defaultTimeout, jasmine.any(Function));
    });

    it("does not call back", function () {
      expect(callback).not.to.have.been.called;
    });

    describe("function run completes", function() {
      var stepResult, attachments;

      beforeEach(function () {
        stepResult = createSpy("step result");
        attachments = createSpy("attachments");
        sinon.stub(Cucumber.Runtime, 'StepResult').returns(stepResult);
      });

      describe("without error", function() {
        beforeEach(function () {
          sinon.stubStub(scenario, 'getAttachments').returns(attachments);
          var runCallback = Cucumber.Util.run.calls.mostRecent().args[4];
          runCallback();
        });

        it("gets the attachments from the scenario", function () {
          expect(scenario.getAttachments).to.have.been.called;
        });

        it("creates a successful step result", function () {
          expect(Cucumber.Runtime.StepResult).to.have.been.calledWith({
            step: step,
            stepDefinition: stepDefinition,
            duration: jasmine.any(Number),
            attachments: attachments,
            status: Cucumber.Status.PASSED
          });
        });

        it("calls back", function () {
          expect(callback).to.have.been.calledWith(stepResult);
        });
      });

      describe("with error", function () {
        var runCallback;
        beforeEach(function () {
          sinon.stubStub(scenario, 'getAttachments').returns(attachments);
          runCallback = Cucumber.Util.run.calls.mostRecent().args[4];
        });
        describe("of string type", function () {
          var failureReason = "failure reason";
          beforeEach(function () {
            runCallback(failureReason);
          });

          it("gets the attachments from the scenario", function () {
            expect(scenario.getAttachments).to.have.been.called;
          });

          it("creates a failing step result", function () {
            expect(Cucumber.Runtime.StepResult).to.have.been.calledWith({
              step: step,
              stepDefinition: stepDefinition,
              failureException: failureReason,
              duration: jasmine.any(Number),
              attachments: attachments,
              status: Cucumber.Status.FAILED
            });
          });

          it("calls back", function () {
            expect(callback).to.have.been.calledWith(stepResult);
          });
        });

        describe("of non-serializable type", function () {
          it("creates a failing step result with a string for failureException", function () {
            var nonSerializableErrorObject = {};
            nonSerializableErrorObject.member = nonSerializableErrorObject;
            runCallback(nonSerializableErrorObject);
            expect(Cucumber.Runtime.StepResult).to.have.been.calledWith({
              step: step,
              stepDefinition: stepDefinition,
              failureException: jasmine.any(String),
              duration: jasmine.any(Number),
              attachments: attachments,
              status: Cucumber.Status.FAILED
            });
          });
        });

        describe("of Error type", function () {
          it("creates a failing step result with the Error for failureException", function () {
            var testError = new Error("Test Error");
            runCallback(testError);
            expect(Cucumber.Runtime.StepResult).to.have.been.calledWith({
              step: step,
              stepDefinition: stepDefinition,
              failureException: testError,
              duration: jasmine.any(Number),
              attachments: attachments,
              status: Cucumber.Status.FAILED
            });
          });
        });
      });

      describe("with 'pending'", function () {
        beforeEach(function () {
          sinon.stubStub(scenario, "getAttachments").returns(attachments);
          var runCallback = Cucumber.Util.run.calls.mostRecent().args[4];
          runCallback(null, 'pending');
        });

        it("gets the attachments from the scenario", function () {
          expect(scenario.getAttachments).to.have.been.called;
        });

        it("creates a pending step result", function () {
          expect(Cucumber.Runtime.StepResult).to.have.been.calledWith({
            step: step,
            stepDefinition: stepDefinition,
            duration: jasmine.any(Number),
            attachments: attachments,
            status: Cucumber.Status.PENDING
          });
        });

        it("calls back", function () {
          expect(callback).to.have.been.calledWith(stepResult);
        });
      });
    });
  });

  describe("buildInvocationParameters()", function () {
    var patternRegexp, step, stepName, stepAttachmentContents;
    var matches, scenario;

    beforeEach(function () {
      stepName = createSpy("step name to match");
      matches = ['full match', 'arg1', 'arg2'];
      patternRegexp = createStubbedObject({test: matches});
      stepAttachmentContents = createSpy("step attachment contents");
      step = createStubbedObject({hasAttachment: null, getName: stepName, getAttachmentContents: stepAttachmentContents});
      scenario = createSpy("scenario");
      sinon.stub(stepDefinition, 'getPatternRegexp').returns(patternRegexp);
      sinon.stubStub(patternRegexp, 'exec').returns(matches);
      sinon.stubStub(step, 'getArguments').returns([]);
    });

    it("executes the pattern regexp against the step name", function () {
      stepDefinition.buildInvocationParameters(step, scenario);
      expect(patternRegexp.exec).to.have.been.calledWith(stepName);
    });

    it("returns the arg", function () {
      var result = stepDefinition.buildInvocationParameters(step, scenario);
      expect(result).to.eql(['arg1', 'arg2']);
    });

    describe("when the step has an doc string argument", function () {
      beforeEach(function () {
        var docStringArgument = createStubbedObject('doc string', {getContent: 'doc string content', getType: 'DocString'});
        step.getArguments.returns([docStringArgument]);
      });

      it("adds the doc string content as an argument", function () {
        var result = stepDefinition.buildInvocationParameters(step, scenario);
        expect(result).to.eql(['arg1', 'arg2', 'doc string content']);
      });
    });

    describe("when the step has an doc string argument", function () {
      var dataTableArgument;

      beforeEach(function () {
        dataTableArgument = createStubbedObject('data table', {getType: 'DataTable'});
        step.getArguments.returns([dataTableArgument]);
      });

      it("adds the data table as an argument", function () {
        var result = stepDefinition.buildInvocationParameters(step, scenario);
        expect(result).to.eql(['arg1', 'arg2', dataTableArgument]);
      });
    });
  });

  describe("buildExceptionHandlerToCodeCallback()", function () {
    var codeCallback, exceptionHandler;

    beforeEach(function () {
      codeCallback = createSpy("code callback");
      exceptionHandler = stepDefinition.buildExceptionHandlerToCodeCallback(codeCallback);
    });

    it("returns an exception handler", function () {
      expect(exceptionHandler).toBeAFunction ();
    });

    describe("returned exception handler", function () {
      var exception;

      beforeEach(function () {
        exception = createSpy("exception");
      });

      it("calls back as a failure with the exception", function () {
        exceptionHandler(exception);
        expect(codeCallback).to.have.been.calledWith(exception);
      });
    });
  });
});
