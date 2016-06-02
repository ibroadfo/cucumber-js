

describe("Cucumber.SupportCode.Hook", function () {
  var Cucumber = requireLib('cucumber');
  var hook, code, options, uri, line, stepDefinition;

  beforeEach(function () {
    code = createSpy("hook code");
    options = {};
    uri = 'uri';
    line = 1;
    stepDefinition = createSpy("step definition");
    sinon.stub(Cucumber.SupportCode, 'StepDefinition').returns(stepDefinition);
    hook = Cucumber.SupportCode.Hook(code, options, uri, line);
  });

  describe("constructor", function () {
    it("inherits from Cucumber.SupportCode.StepDefinition", function () {
      expect(Cucumber.SupportCode.StepDefinition).to.have.been.calledWith('', {}, code, uri, line);
      expect(hook).to.equal(stepDefinition);
    });
  });

  describe("buildInvocationParameters()", function () {
    var step, scenario;

    beforeEach(function () {
      step = createSpy("step");
      scenario = createSpy("scenario");
    });

    it("returns an array containing the scenario", function () {
      expect(hook.buildInvocationParameters(step, scenario)).to.eql([scenario]);
    });
  });

  describe("appliesToScenario()", function () {
    var scenario, astFilter, scenarioEnrolled;

    beforeEach(function () {
      scenarioEnrolled = createSpy("scenario enrolled?");
      astFilter        = createStubbedObject({ isElementEnrolled: scenarioEnrolled });
      scenario         = createSpy("scenario");
      sinon.stub(hook, 'getAstFilter').returns(astFilter);
    });

    it("gets the AST filter", function () {
      hook.appliesToScenario(scenario);
      expect(hook.getAstFilter).to.have.been.called;
    });

    it("asks the AST filter whether the scenario is enrolled or not", function () {
      hook.appliesToScenario(scenario);
      expect(astFilter.isElementEnrolled).to.have.been.calledWith(scenario);
    });

    it("returns the AST filter answer", function () {
      expect(hook.appliesToScenario(scenario)).to.equal(scenarioEnrolled);
    });
  });

  describe("getAstFilter()", function () {
    var tags, tagGroups, rules, astFilter;

    beforeEach(function () {
      tagGroups = [createSpy("tag group 1"), createSpy("tag group 2")];
      tags      = createSpy("tags");
      options   = {tags: tags};
      hook      = Cucumber.SupportCode.Hook(code, options);
      rules     = [createSpy("rule 1"), createSpy("rule 2")];
      astFilter = createSpy("AST filter");
      sinon.stub(Cucumber.TagGroupParser, 'getTagGroupsFromStrings').returns(tagGroups);
      sinon.stub(Cucumber.Ast, 'Filter').returns(astFilter);
      sinon.stubStub(Cucumber.Ast.Filter, 'AnyOfTagsRule').and.returnValues.apply(null, rules);

    });

    it("gets the tag groups from the 'tags' option", function () {
      hook.getAstFilter();
      expect(Cucumber.TagGroupParser.getTagGroupsFromStrings).to.have.been.calledWith(tags);
    });

    it("builds a new 'any of tags' AST filter rule based on each tag groupe", function () {
      hook.getAstFilter();
      tagGroups.forEach(function (tagGroup) {
        expect(Cucumber.Ast.Filter.AnyOfTagsRule).to.have.been.calledWith(tagGroup);
      });
    });

    it("instantiates AST filter based on the rules", function () {
      hook.getAstFilter();
      expect(Cucumber.Ast.Filter).to.have.been.calledWith(rules);
    });

    it("returns the AST filter", function () {
      expect(hook.getAstFilter()).to.equal(astFilter);
    });
  });
});
