

describe("Cucumber.Ast.HookStep", function () {
  var Cucumber = requireLib('cucumber');
  var keyword, step, hookStep;

  beforeEach(function () {
    keyword = "keyword";
    step = {inherited: 'step functions'};
    sinon.stub(Cucumber.Ast, 'Step').returns(step);
    hookStep = Cucumber.Ast.HookStep(keyword);
  });

  afterEach(function() {
    Cucumber.Ast.Step.restore();
  })

  describe("constructor", function () {
    it("inherits from Cucumber.Ast.Step", function () {
      expect(Cucumber.Ast.Step).to.have.been.calledWith({});
      expect(hookStep).to.equal(step);
    });
  });

  describe("getKeyword()", function () {
    it("returns true for a hook step", function () {
      expect(hookStep.getKeyword()).to.eql(keyword);
    });
  });

  describe("isHidden()", function () {
    it("returns true for a hook step", function () {
      expect(hookStep.isHidden()).to.equal(true);
    });
  });

  describe("hasUri()", function () {
    it("returns false as hook steps do not have URIs", function () {
      expect(hookStep.hasUri()).to.equal(false);
    });
  });
});
