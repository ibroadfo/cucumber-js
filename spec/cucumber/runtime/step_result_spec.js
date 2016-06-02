

describe("Cucumber.Runtime.StepResult", function () {
  var Cucumber = requireLib('cucumber');
  var stepResult, step, attachments, failureException, status;

  beforeEach(function () {
    step        = createSpy("step");
    attachments = [];
    failureException = new Error('some error');
    status = Cucumber.Status.PASSED;
    stepResult = Cucumber.Runtime.StepResult({
      step: step,
      duration: 123,
      attachments: attachments,
      status: status,
      failureException: failureException
    });
  });

  describe("getStep()", function () {
    it("returns the step passed to the constructor", function () {
      expect(stepResult.getStep()).to.equal(step);
    });
  });

  describe("getDuration()", function () {
    it("returns the duration passed to the constructor", function () {
      expect(stepResult.getDuration()).to.equal(123);
    });
  });

  describe("getStatus()", function () {
    it("returns the step passed to the constructor", function () {
      expect(stepResult.getStatus()).to.equal(status);
    });
  });

  describe("getFailureException()", function () {
    it("returns the step passed to the constructor", function () {
      expect(stepResult.getFailureException()).to.equal(failureException);
    });
  });

  describe("hasAttachments()", function () {
    describe("when there are no attachments", function () {
      it("returns false", function () {
        expect(stepResult.hasAttachments()).not.to.be.ok;
      });
    });

    describe("when there are attachments", function () {
      beforeEach(function () {
        attachments.push(1);
      });

      it("returns true", function () {
        expect(stepResult.hasAttachments()).to.be.ok;
      });
    });
  });

  describe("getAttachments()", function () {
    it("returns the attachments passed to the constructor", function () {
      expect(stepResult.getAttachments()).to.equal(attachments);
    });
  });
});
