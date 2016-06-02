require('../support/spec_helper');
require('../support/configurations_shared_examples.js');

describe("Cucumber.VolatileConfiguration", function () {
  var Cucumber = requireLib('cucumber');

  var featureSources, supportCodeInitializer, configuration;
  var supportCodeLibrary;
  var context = {};

  beforeEach(function () {
    supportCodeLibrary       = createSpy("support code library");
    sinon.stub(Cucumber.SupportCode, 'Library').returns(supportCodeLibrary);
    featureSources            = createSpy("feature source");
    supportCodeInitializer   = createSpy("support code initializer");
    configuration            = Cucumber.VolatileConfiguration(featureSources, supportCodeInitializer);
    context.configuration    = configuration;
  });

  itBehavesLikeAllCucumberConfigurations(context);

  describe("constructor", function () {
    it("creates a support code library with the initializer", function () {
      expect(Cucumber.SupportCode.Library).to.have.been.calledWith(supportCodeInitializer);
    });
  });

  describe("getFeatureSources()", function () {
    describe("when a single feature source string is passed", function () {
      beforeEach(function () {
        featureSources.replace = function () {};
      });

      it("returns the feature source and its volatile name", function () {
        var featureNameSourcePair = [Cucumber.VolatileConfiguration.FEATURE_SOURCE_NAME, featureSources];
        var featureSourceArray    = [featureNameSourcePair];
        expect(configuration.getFeatureSources()).to.eql(featureSourceArray);
      });
    });

    describe("when an array of features is passed", function () {
      it("returns the array", function () {
        expect(configuration.getFeatureSources()).to.eql(featureSources);
      });
    });
  });

  describe("getAstFilter()", function () {
    var astFilter, tagFilterRules;

    beforeEach(function () {
      astFilter      = createStubbedObject("AST filter");
      tagFilterRules = createSpy("tag specs");
      sinon.stub(Cucumber.Ast, 'Filter').returns(astFilter);
      sinon.stub(configuration, 'getTagAstFilterRules').returns(tagFilterRules);
    });

    it("gets the tag filter rules", function () {
      configuration.getAstFilter();
      expect(configuration.getTagAstFilterRules).to.have.been.called;
    });

    it("instantiates an AST filter", function () {
      configuration.getAstFilter();
      expect(Cucumber.Ast.Filter).to.have.been.calledWith(tagFilterRules);
    });

    it("returns the AST filter", function () {
      expect(configuration.getAstFilter()).to.equal(astFilter);
    });
  });

  describe("getSupportCodeLibrary()", function () {
    it("returns the support code library", function () {
      expect(configuration.getSupportCodeLibrary()).to.equal(supportCodeLibrary);
    });
  });

  describe("isStrictRequested()",function () {
		it("is false if strict option is not specified",function () {
			configuration = Cucumber.VolatileConfiguration(featureSources, supportCodeInitializer, {});
			expect(configuration.isStrictRequested()).to.eql(false);
		});

		it("is true if strict option is set",function () {
			configuration	= Cucumber.VolatileConfiguration(featureSources, supportCodeInitializer, {strict:true});
			expect(configuration.isStrictRequested()).to.eql(true);
		});
	});

  describe("getTagAstFilterRules()", function () {
    var tagGroupStrings;

    describe("when there are no tags specified", function () {
      it("returns an empty set of rules", function () {
        expect(configuration.getTagAstFilterRules()).to.eql([]);
      });
    });

    describe("when some tags were specified", function () {
      var rules;

      beforeEach(function () {
        tagGroupStrings = [createSpy("tag group string 1"), createSpy("tag group string 2"), createSpy("tag group string 3")];
        rules           = [createSpy("rule 1"), createSpy("rule 2"), createSpy("rule 3")];
        configuration   = Cucumber.VolatileConfiguration(featureSources, supportCodeInitializer, {tags: tagGroupStrings});
        sinon.stub(configuration, 'buildAstFilterRuleFromTagGroupString').and.returnValues.apply(null, rules);
      });

      it("builds the filter rule based on the tags", function () {
        configuration.getTagAstFilterRules();
        tagGroupStrings.forEach(function (tagGroupString) {
          expect(configuration.buildAstFilterRuleFromTagGroupString).to.have.been.calledWith(tagGroupString);
        });
      });

      it("returns the rules", function () {
        expect(configuration.getTagAstFilterRules()).to.eql(rules);
      });
    });
  });

  describe("buildAstFilterRuleFromTagGroupString()", function () {
    var tagGroupString, tagGroup, tagGroupParser, rule;

    beforeEach(function () {
      tagGroupString = createSpy("tag group string");
      tagGroup       = createSpy("tag group");
      tagGroupParser = createStubbedObject({parse: tagGroup});
      rule           = createSpy("rule");
      sinon.stub(Cucumber, 'TagGroupParser').returns(tagGroupParser);
      sinon.stub(Cucumber.Ast.Filter, 'AnyOfTagsRule').returns(rule);
    });

    it("instantiates a tag group parser", function () {
      configuration.buildAstFilterRuleFromTagGroupString(tagGroupString);
      expect(Cucumber.TagGroupParser).to.have.been.calledWith(tagGroupString);
    });

    it("parses the tag group", function () {
      configuration.buildAstFilterRuleFromTagGroupString(tagGroupString);
      expect(tagGroupParser.parse).to.have.been.called;
    });

    it("instantiates an 'any of tags' rule based on the tag group", function () {
      configuration.buildAstFilterRuleFromTagGroupString(tagGroupString);
      expect(Cucumber.Ast.Filter.AnyOfTagsRule).to.have.been.calledWith(tagGroup);
    });

    it("returns the rule", function () {
      var returned = configuration.buildAstFilterRuleFromTagGroupString(tagGroupString);
      expect(returned).to.equal(rule);
    });
  });

  describe("shouldFilterStackTraces", function () {
    it("returns true by default", function () {
      configuration = Cucumber.VolatileConfiguration(featureSources, supportCodeInitializer, {});
			expect(configuration.shouldFilterStackTraces()).to.equal(true);
    });

    it("returns false when the backtrace option is true", function () {
      configuration = Cucumber.VolatileConfiguration(featureSources, supportCodeInitializer, { backtrace: true });
			expect(configuration.shouldFilterStackTraces()).to.equal(false);
    });

    it("returns true when the backtrace option is false", function () {
      configuration = Cucumber.VolatileConfiguration(featureSources, supportCodeInitializer, { backtrace: false});
			expect(configuration.shouldFilterStackTraces()).to.equal(true);
    });
  });
});
