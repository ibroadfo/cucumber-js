

describe("Cucumber.Listener.Formatter", function () {
  var Cucumber = requireLib('cucumber');
  var formatter, listener;

  beforeEach(function () {
    var Formatter = Cucumber.Listener.Formatter;
    listener = createSpy("listener");
    sinon.stub(Cucumber, 'Listener').returns(listener);
    Cucumber.Listener.Formatter = Formatter;
    formatter = Cucumber.Listener.Formatter();
  });

  describe("constructor", function () {
    it("creates a listener", function () {
      expect(Cucumber.Listener).to.have.been.called;
    });

    it("extends the formatter", function () {
      expect(formatter).to.equal(listener);
    });
  });

  describe("log()", function () {
    var logged, alsoLogged, loggedBuffer;

    beforeEach(function () {
      logged       = "this was logged";
      alsoLogged   = "this was also logged";
      loggedBuffer = logged + alsoLogged;
      sinon.stub(process.stdout, 'write');
    });

    it("records logged strings", function () {
      formatter.log(logged);
      formatter.log(alsoLogged);
      expect(formatter.getLogs()).to.equal(loggedBuffer);
    });

    describe("when asked to output to a stream", function () {
      var stream;

      beforeEach(function () {
        stream = createStubbedObject('stream', {write: null});
        formatter = Cucumber.Listener.Formatter({stream: stream});
      });

      it("outputs the logged string to the stream", function () {
        formatter.log(logged);
        expect(stream.write).to.have.been.calledWith(logged);
      });
    });

    describe("when asked to output to a function", function () {
      var userFunction;

      beforeEach(function () {
        userFunction      = createSpy("output user function");
        formatter = Cucumber.Listener.Formatter({logToFunction: userFunction});
      });

      it("calls the function with the logged string", function () {
        formatter.log(logged);
        expect(userFunction).to.have.been.calledWith(logged);
      });
    });
  });

  describe("getLogs()", function () {
    it("returns the logged buffer", function () {
      var logged       = "this was logged";
      var alsoLogged   = "this was also logged";
      var loggedBuffer = logged + alsoLogged;
      sinon.stub(process.stdout, 'write'); // prevent actual output during spec execution
      formatter.log(logged);
      formatter.log(alsoLogged);
      expect(formatter.getLogs()).to.equal(loggedBuffer);
    });

    it("returns an empty string when the progress formatter did not log anything yet", function () {
      expect(formatter.getLogs()).to.equal("");
    });
  });
});
