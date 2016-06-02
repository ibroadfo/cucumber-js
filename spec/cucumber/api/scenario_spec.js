describe("Cucumber.Api.Scenario", function () {
  var Cucumber = requireLib('cucumber');
  var stream = require('stream');
  var failureException, scenarioResult;
  var keyword, name, description, uri, line, tags, astScenario;
  var scenario;

  beforeEach(function () {
    keyword = "scenario keyword";
    name = "scenario name";
    description = "scenario description";
    uri = "scenario uri";
    line = "scenario starting line number";
    tags = "scenario tags";
    astScenario = createStubbedObject({
      getKeyword: keyword,
      getName: name,
      getDescription: description,
      getUri: uri,
      getLine: line,
      getTags: tags
    });

    failureException = "failure exception"
    scenarioResult = createStubbedObject({
      getStatus: null,
      getFailureException: failureException
    });

    scenario = Cucumber.Api.Scenario(astScenario, scenarioResult);
  });

  describe("getKeyword()", function () {
    it("returns the keyword of the scenario", function () {
      expect(scenario.getKeyword()).to.equal(keyword);
    });
  });

  describe("getName()", function () {
    it("returns the name of the scenario", function () {
      expect(scenario.getName()).to.equal(name);
    });
  });

  describe("getDescription()", function () {
    it("returns the description of the scenario", function () {
      expect(scenario.getDescription()).to.equal(description);
    });
  });

  describe("getUri()", function () {
    it("returns the URI on which the background starts", function () {
      expect(scenario.getUri()).to.equal(uri);
    });
  });

  describe("getLine()", function () {
    it("returns the line on which the scenario starts", function () {
      expect(scenario.getLine()).to.equal(line);
    });
  });

  describe("getTags()", function () {
    it("returns the tags on the scenario, including inherited tags", function () {
      expect(scenario.getTags()).to.equal(tags);
    });
  });

  describe("isSuccessful()", function () {
    describe('scenario passed', function () {
      beforeEach(function() {
        scenarioResult.getStatus.returns(Cucumber.Status.PASSED);
      });

      it("returns true", function () {
        expect(scenario.isSuccessful()).to.eql(true);
      });
    });

    describe('scenario did not pass', function () {
      it("returns false", function () {
        expect(scenario.isSuccessful()).to.eql(false);
      });
    });
  });

  describe("isFailed()", function () {
    describe('scenario failed', function () {
      beforeEach(function() {
        scenarioResult.getStatus.returns(Cucumber.Status.FAILED);
      });

      it("returns true", function () {
        expect(scenario.isFailed()).to.eql(true);
      });
    });

    describe('scenario did not fail', function () {
      it("returns false", function () {
        expect(scenario.isFailed()).to.eql(false);
      });
    });
  });

  describe("isPending()", function () {
    describe('scenario is pending', function () {
      beforeEach(function() {
        scenarioResult.getStatus.returns(Cucumber.Status.PENDING);
      });

      it("returns true", function () {
        expect(scenario.isPending()).to.eql(true);
      });
    });

    describe('scenario is not pending', function () {
      it("returns false", function () {
        expect(scenario.isPending()).to.eql(false);
      });
    });
  });

  describe("isUndefined()", function () {
    describe('scenario is undefined', function () {
      beforeEach(function() {
        scenarioResult.getStatus.returns(Cucumber.Status.UNDEFINED);
      });

      it("returns true", function () {
        expect(scenario.isUndefined()).to.eql(true);
      });
    });

    describe('scenario is not undefined', function () {
      it("returns false", function () {
        expect(scenario.isUndefined()).to.eql(false);
      });
    });
  });

  describe("isSkipped()", function () {
    describe('scenario is skipped', function () {
      beforeEach(function() {
        scenarioResult.getStatus.returns(Cucumber.Status.SKIPPED);
      });

      it("returns true", function () {
        expect(scenario.isSkipped()).to.eql(true);
      });
    });

    describe('scenario is not skipped', function () {
      it("returns false", function () {
        expect(scenario.isSkipped()).to.eql(false);
      });
    });
  });

  describe("getException()", function () {
    it("returns the exception raised when running the scenario", function () {
      expect(scenario.getException()).to.equal(failureException);
    });
  });

  describe("attach()", function () {
    var mimeType, callback;

    beforeEach(function () {
      mimeType = "mime type"
      callback = sinon.spy()
    });

    describe("when the data is a stream.Readable", function () {
      var passThroughStream;

      beforeEach(function () {
        passThroughStream = new stream.PassThrough()
      });

      it("throws an exception when the mimeType argument is missing", function () {
        expect(function () { scenario.attach(passThroughStream); }).to.throw("Cucumber.Api.Scenario.attach() expects a mimeType");
      });

      it("throws an exception when the callback argument is missing", function () {
        expect(function () { scenario.attach(passThroughStream, mimeType); }).to.throw("Cucumber.Api.Scenario.attach() expects a callback when data is a stream.Readable");
      });

      describe("with a mimeType and a callback", function () {
        beforeEach(function (done) {
          scenario.attach(passThroughStream, mimeType, done);
          passThroughStream.write(new Buffer("first chunk"))
          passThroughStream.write(new Buffer("second chunk"));
          passThroughStream.end();
        });

        it("saves the attachment with the contents of the stream", function () {
          var attachments = scenario.getAttachments();
          expect(attachments.length).to.eql(1);
          var attachment = attachments[0];
          expect(attachment.getData()).to.eql("first chunksecond chunk");
          expect(attachment.getMimeType()).to.eql(mimeType);
        });
      });
    });

    describe("when the data is a Buffer", function () {
      var buffer;

      beforeEach(function () {
        buffer = new Buffer("data");
      });

      it("throws an exception when the mimeType argument is missing", function () {
        expect(function () { scenario.attach(buffer); }).to.throw("Cucumber.Api.Scenario.attach() expects a mimeType");
      });

      it("saves the attachment containing the contents of the buffer", function () {
        scenario.attach(buffer, mimeType);
        var attachments = scenario.getAttachments();
        expect(attachments.length).to.eql(1);
        var attachment = attachments[0];
        expect(attachment.getData()).to.eql("data");
        expect(attachment.getMimeType()).to.eql(mimeType);
      });

      describe("when provided with a callback", function () {
        beforeEach(function () {
          scenario.attach(buffer, mimeType, callback);
        });

        it("calls back", function () {
          expect(callback).to.have.been.called;
        });
      });

      describe("when not provided with a callback", function () {
        beforeEach(function () {
          scenario.attach(buffer, mimeType);
        });

        it("does not call back", function () {
          expect(callback).not.to.have.been.called;
        });
      });
    });

    describe("when the data is a string", function () {
      var data;

      beforeEach(function () {
        data = "data";
      });

      it("saves the attachment containing the string", function () {
        scenario.attach(data, mimeType);
        var attachments = scenario.getAttachments();
        expect(attachments.length).to.eql(1);
        var attachment = attachments[0];
        expect(attachment.getData()).to.eql("data");
        expect(attachment.getMimeType()).to.eql(mimeType);
      });

      it("defaults to the plain text mime type when the mimeType argument is missing", function () {
        scenario.attach(data);
        var attachments = scenario.getAttachments();
        expect(attachments.length).to.eql(1);
        var attachment = attachments[0];
        expect(attachment.getData()).to.eql("data");
        expect(attachment.getMimeType()).to.eql("text/plain");
      });

      it("calls back if a callback is given", function () {
        var callback = sinon.spy();
        scenario.attach(data, null, callback);
        expect(callback).to.have.been.called;
      });
    });
  });
});
