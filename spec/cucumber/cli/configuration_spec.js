require('../../support/configurations_shared_examples.js');

describe("Cucumber.Cli.Configuration", function () {
  var Cucumber = requireLib('cucumber');
  var fs = require('fs');
  var args, configuration, options;
  var context = {};

  beforeEach(function () {
    options = {};
    args = [];
    configuration = Cucumber.Cli.Configuration(options, args);
    context.configuration = configuration;
  });

  itBehavesLikeAllCucumberConfigurations(context);

  describe("getFormatters()", function () {
    var formatter, formatterOptions;

    beforeEach(function () {
      var shouldUseColors = "use colors";
      var snippetSyntax = "snippet syntax";
      formatterOptions = {
        snippetSyntax: snippetSyntax,
        stream: process.stdout,
        useColors: shouldUseColors
      };
      options.colors = shouldUseColors;
      sinon.stub(Cucumber.Listener, 'JsonFormatter');
      sinon.stub(Cucumber.Listener, 'ProgressFormatter');
      sinon.stub(Cucumber.Listener, 'PrettyFormatter');
      sinon.stub(Cucumber.Listener, 'SummaryFormatter');
      sinon.stub(Cucumber.SupportCode.StepDefinitionSnippetBuilder, 'JavaScriptSyntax').returns(snippetSyntax);
      formatter = "formatter";
    });

    afterEach(function(){
      Cucumber.Listener.JsonFormatter.restore()
      Cucumber.Listener.ProgressFormatter.restore()
      Cucumber.Listener.PrettyFormatter.restore()
      Cucumber.Listener.SummaryFormatter.restore()
      Cucumber.SupportCode.StepDefinitionSnippetBuilder.JavaScriptSyntax.restore()
    })

    describe("when the formatter name is \"json\"", function () {
      beforeEach(function () {
        options.format = ['json'];
        Cucumber.Listener.JsonFormatter.returns(formatter);
      });

      it("creates a new json formatter", function () {
        configuration.getFormatters();
        expect(Cucumber.Listener.JsonFormatter).to.have.been.calledWith(formatterOptions);
      });

      it("returns the json formatter", function () {
        expect(configuration.getFormatters()).to.eql([formatter]);
      });
    });

    describe("when the formatter name is \"progress\"", function () {
      beforeEach(function () {
        options.format = ['progress'];
        Cucumber.Listener.ProgressFormatter.returns(formatter);
      });

      it("creates a new progress formatter", function () {
        configuration.getFormatters();
        expect(Cucumber.Listener.ProgressFormatter).to.have.been.calledWith(formatterOptions);
      });

      it("returns the progress formatter", function () {
        expect(configuration.getFormatters()).to.eql([formatter]);
      });
    });

    describe("when the formatter name is \"pretty\"", function () {
      beforeEach(function () {
        options.format = ['pretty'];
        Cucumber.Listener.PrettyFormatter.returns(formatter);
      });

      it("creates a new pretty formatter", function () {
        configuration.getFormatters();
        expect(Cucumber.Listener.PrettyFormatter).to.have.been.calledWith(formatterOptions);
      });

      it("returns the pretty formatter", function () {
        expect(configuration.getFormatters()).to.eql([formatter]);
      });
    });

    describe("when the formatter name is \"summary\"", function () {
      beforeEach(function () {
        options.format = ['summary'];
        Cucumber.Listener.SummaryFormatter.returns(formatter);
      });

      it("creates a new summary formatter", function () {
        configuration.getFormatters();
        expect(Cucumber.Listener.SummaryFormatter).to.have.been.calledWith(formatterOptions);
      });

      it("returns the summary formatter", function () {
        expect(configuration.getFormatters()).to.eql([formatter]);
      });
    });

    describe("when the formatter output is redirected", function () {
      var fd;

      beforeEach(function () {
        fd = 'fd';
        sinon.stub(fs, 'openSync').returns(fd);

        var stream = 'stream';
        formatterOptions.stream = stream;
        sinon.stub(fs, 'createWriteStream').returns(stream);
      });

      afterEach(function() {
        fs.openSync.restore()
        fs.createWriteStream.restore()
      })

      describe("when the output file does not include a colon", function() {
        beforeEach(function () {
          options.format = ['json:path/to/file'];
          Cucumber.Listener.JsonFormatter.returns(formatter);
        });

        it("opens the file for writing", function () {
          configuration.getFormatters();
          expect(fs.openSync).to.have.been.calledWith('path/to/file', 'w');
        });

        it("creates a write stream to the file", function () {
          configuration.getFormatters();
          expect(fs.createWriteStream).to.have.been.calledWith(null, {fd: fd});
        });

        it("creates a new json formatter", function () {
          configuration.getFormatters();
          expect(Cucumber.Listener.JsonFormatter).to.have.been.calledWith(formatterOptions);
        });

        it("returns the formatter", function () {
          expect(configuration.getFormatters()).to.eql([formatter]);
        });
      });

      describe("when the output file includes a colon", function() {
        beforeEach(function () {
          options.format = ['json:windows:path/to/file'];
          Cucumber.Listener.JsonFormatter.returns(formatter);
        });

        it("opens the file for writing", function () {
          configuration.getFormatters();
          expect(fs.openSync).to.have.been.calledWith('windows:path/to/file', 'w');
        });

        it("creates a write stream to the file", function () {
          configuration.getFormatters();
          expect(fs.createWriteStream).to.have.been.calledWith(null, {fd: fd});
        });

        it("creates a new json formatter", function () {
          configuration.getFormatters();
          expect(Cucumber.Listener.JsonFormatter).to.have.been.calledWith(formatterOptions);
        });

        it("returns the formatter", function () {
          expect(configuration.getFormatters()).to.eql([formatter]);
        });
      });
    });

    describe("when the formatter name is unknown", function () {
      beforeEach(function () {
        options.format = ['blah'];
      });

      it("throws an exceptions", function () {
        expect(configuration.getFormatters).to.throw();
      });
    });
  });
});
