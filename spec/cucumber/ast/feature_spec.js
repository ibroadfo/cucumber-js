describe("Cucumber.Ast.Feature", function () {
  var Cucumber = requireLib('cucumber');
  var Gherkin = require('gherkin');
  var feature, scenario1, scenario2, tag1, tag2;

  beforeEach(function () {
    var featureData = {
      description: 'description',
      keyword: 'keyword',
      location: {line: 1},
      name: 'name',
      tags: [
        {tag1: 'data'},
        {tag2: 'data'}
      ],
      uri: 'uri'
    };

    scenario1 = createStubbedObject({setFeature: null});
    scenario2 = createStubbedObject({setFeature: null});
    var scenarios = [scenario1, scenario2];

    tag1 = 'tag 1';
    tag2 = 'tag 2';
    sinon.stub(Cucumber.Ast, 'Tag')
      .onCall(0).returns(tag1)
      .onCall(1).returns(tag2);

    feature = Cucumber.Ast.Feature(featureData, scenarios);
  });

  afterEach(function() {
    Cucumber.Ast.Tag.restore();
  });

  describe("constructor", function () {
    it('creates tags', function () {
      expect(Cucumber.Ast.Tag).to.have.been.calledWith({tag1: 'data'});
      expect(Cucumber.Ast.Tag).to.have.been.calledWith({tag2: 'data'});
    });
  });

  describe('getStepKeywordByLines()', function() {
    describe('from a background', function() {
      beforeEach(function() {
        var source =
          'Feature: Foo\n' +
          '  Background:\n' +
          '    Given a\n' +
          '  Scenario: Bar\n' +
          '    Then b\n';
        var gherkinDocument = new Gherkin.Parser().parse(source);
        feature = Cucumber.Ast.Feature(gherkinDocument.feature, []);
      });

      it('returns the keyword', function() {
        expect(feature.getStepKeywordByLines([3])).to.eql('Given ');
      });
    });

    describe('from a scenario', function() {
      beforeEach(function() {
        var source =
          'Feature: Foo\n' +
          '  Scenario: Bar\n' +
          '    Then b\n';
        var gherkinDocument = new Gherkin.Parser().parse(source);
        feature = Cucumber.Ast.Feature(gherkinDocument.feature, []);
      });

      it('returns the keyword', function() {
        expect(feature.getStepKeywordByLines([3])).to.eql('Then ');
      });
    });

    describe('from a scenario outline', function() {
      beforeEach(function() {
        var source =
          'Feature: Foo\n' +
          '  Scenario Outline: Bar\n' +
          '    When <what>\n' +
          '  Examples:\n' +
          '    | what |\n' +
          '    | b    |';
        var gherkinDocument = new Gherkin.Parser().parse(source);
        feature = Cucumber.Ast.Feature(gherkinDocument.feature, []);
      });

      it('returns the keyword', function() {
        expect(feature.getStepKeywordByLines([3])).to.eql('When ');
      });
    });
  });

  describe("getKeyword()", function () {
    it("returns the keyword of the feature", function () {
      expect(feature.getKeyword()).to.eql('keyword');
    });
  });

  describe("getName()", function () {
    it("returns the name of the feature", function () {
      expect(feature.getName()).to.eql('name');
    });
  });

  describe("getDescription()", function () {
    it("returns the description of the feature", function () {
      expect(feature.getDescription()).to.eql('description');
    });
  });

  describe("getUri()", function () {
    it("returns the URI of the feature", function () {
      expect(feature.getUri()).to.eql('uri');
    });
  });

  describe("getLine()", function () {
    it("returns the line number on which the feature starts", function () {
      expect(feature.getLine()).to.eql(1);
    });
  });

  describe("getTags()", function () {
    it("returns the tags", function () {
      expect(feature.getTags()).to.eql([tag1, tag2]);
    });
  });
});
