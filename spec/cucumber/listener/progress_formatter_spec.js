

describe("Cucumber.Listener.ProgressFormatter", function () {
  var Cucumber = requireLib('cucumber');
  var colors = require('colors/safe');
  colors.enabled = true;
  var formatter, formatterHearMethod, summaryFormatter, progressFormatter, options;

  beforeEach(function () {
    options             = {useColors: true};
    formatter           = createStubbedObject({finish: null, log: null});
    formatterHearMethod = sinon.stubStub(formatter, 'hear');
    summaryFormatter    = createSpy("summaryFormatter");
    sinon.stub(Cucumber.Listener, 'Formatter').returns(formatter);
    sinon.stub(Cucumber.Listener, 'SummaryFormatter').returns(summaryFormatter);
    progressFormatter = Cucumber.Listener.ProgressFormatter(options);
  });

  describe("constructor", function () {
    it("creates a formatter", function () {
      expect(Cucumber.Listener.Formatter).to.have.been.calledWith(options);
    });

    it("extends the formatter", function () {
      expect(progressFormatter).to.equal(formatter);
    });

    it("creates a summary formatter", function () {
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
      progressFormatter.hear(event, callback);
      expect(summaryFormatter.hear).to.have.been.called;
      expect(summaryFormatter.hear).toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(summaryFormatter.hear).toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    describe("summary formatter callback", function () {
      var summaryFormatterCallback;

      beforeEach(function () {
        progressFormatter.hear(event, callback);
        summaryFormatterCallback = summaryFormatter.hear.calls.mostRecent().args[1];
      });

      it("tells the formatter to listen to the event", function () {
        summaryFormatterCallback();
        expect(formatterHearMethod).to.have.been.calledWith(event, callback);
      });
    });
  });

  describe("handleStepResultEvent()", function () {
    var event, callback, step, stepResult;

    beforeEach(function () {
      step       = createStubbedObject({isHidden: false});
      stepResult = createStubbedObject({getStatus: undefined, getStep: step});
      event      = createStubbedObject({getPayloadItem: stepResult});
      callback   = createSpy("callback");
    });

    describe("when the is step hidden", function () {
      beforeEach(function () {
        step.isHidden.returns(true);
      });

      describe("when the step failed", function () {
        beforeEach(function () {
          stepResult.getStatus.returns(Cucumber.Status.FAILED);
          progressFormatter.handleStepResultEvent(event, callback);
        });

        it("logs the step result", function () {
          expect(progressFormatter.log).to.have.been.calledWith(colors.red('F'));
        });

        it("calls back", function () {
          expect(callback).to.have.been.called;
        });
      });

      describe("when the step passed", function () {
        beforeEach(function () {
          stepResult.getStatus.returns(Cucumber.Status.PASSED);
          progressFormatter.handleStepResultEvent(event, callback);
        });

        it("does not log", function () {
          expect(progressFormatter.log).not.to.have.been.called;
        });

        it("calls back", function () {
          expect(callback).to.have.been.called;
        });
      });
    });

    describe("when the is step not hidden", function () {
      beforeEach(function () {
        step.isHidden.returns(false);
      });

      describe("when the step failed", function () {
        beforeEach(function () {
          stepResult.getStatus.returns(Cucumber.Status.FAILED);
          progressFormatter.handleStepResultEvent(event, callback);
        });

        it("logs the step result", function () {
          expect(progressFormatter.log).to.have.been.calledWith(colors.red('F'));
        });

        it("calls back", function () {
          expect(callback).to.have.been.called;
        });
      });

      describe("when the step passed", function () {
        beforeEach(function () {
          stepResult.getStatus.returns(Cucumber.Status.PASSED);
          progressFormatter.handleStepResultEvent(event, callback);
        });

        it("logs the step result", function () {
          expect(progressFormatter.log).to.have.been.calledWith(colors.green('.'));
        });

        it("calls back", function () {
          expect(callback).to.have.been.called;
        });
      });

      describe("when the step is pending", function () {
        beforeEach(function () {
          stepResult.getStatus.returns(Cucumber.Status.PENDING);
          progressFormatter.handleStepResultEvent(event, callback);
        });

        it("logs the step result", function () {
          expect(progressFormatter.log).to.have.been.calledWith(colors.yellow('P'));
        });

        it("calls back", function () {
          expect(callback).to.have.been.called;
        });
      });

      describe("when the step was skipped", function () {
        beforeEach(function () {
          stepResult.getStatus.returns(Cucumber.Status.SKIPPED);
          progressFormatter.handleStepResultEvent(event, callback);
        });

        it("logs the step result", function () {
          expect(progressFormatter.log).to.have.been.calledWith(colors.cyan('-'));
        });

        it("calls back", function () {
          expect(callback).to.have.been.called;
        });
      });

      describe("when the step was undefined", function () {
        beforeEach(function () {
          stepResult.getStatus.returns(Cucumber.Status.UNDEFINED);
          progressFormatter.handleStepResultEvent(event, callback);
        });

        it("logs the step result", function () {
          expect(progressFormatter.log).to.have.been.calledWith(colors.yellow('U'));
        });

        it("calls back", function () {
          expect(callback).to.have.been.called;
        });
      });
    });
  });

  describe("handleAfterFeaturesEvent()", function () {
    var event, summaryLogs, callback;

    beforeEach(function () {
      event       = createSpy("event");
      callback    = createSpy("callback");
      summaryLogs = createSpy("summary logs");
      sinon.stubStub(summaryFormatter, 'getLogs').returns(summaryLogs);
    });

    it("gets the summary", function () {
      progressFormatter.handleAfterFeaturesEvent(event, callback);
      expect(summaryFormatter.getLogs).to.have.been.called;
    });

    it("logs two line feeds", function () {
      progressFormatter.handleAfterFeaturesEvent(event, callback);
      expect(progressFormatter.log).to.have.been.calledWith("\n\n");
    });

    it("logs the summary", function () {
      progressFormatter.handleAfterFeaturesEvent(event, callback);
      expect(progressFormatter.log).to.have.been.calledWith(summaryLogs);
    });

    it("calls finish with the callback", function () {
      progressFormatter.handleAfterFeaturesEvent(event, callback);
      expect(progressFormatter.finish).to.have.been.calledWith(callback);
    });
  });
});
