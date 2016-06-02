describe("Cucumber.Ast.Scenario", function () {
  var Cucumber = requireLib('cucumber');
  var scenario, step1, step2, tag1, tag2;

  beforeEach(function () {
    var scenarioData = {
      description: 'description',
      locations: [{path: 'path', line: 1}, {line: 2}],
      name: 'name',
      steps: [
        {step1: 'data'},
        {step2: 'data'}
      ],
      tags: [
        {tag1: 'data'},
        {tag2: 'data'}
      ]
    };

    step1 = createStubbedObject({setPreviousStep: null, setScenario: null});
    step2 = createStubbedObject({setPreviousStep: null, setScenario: null});
    sinon.stub(Cucumber.Ast, 'Step')
      .onCall(0).returns(step1)
      .onCall(1).returns(step2);

    tag1 = 'tag 1';
    tag2 = 'tag 2';
    sinon.stub(Cucumber.Ast, 'Tag')
      .onCall(0).returns(tag1)
      .onCall(1).returns(tag2);

    scenario = Cucumber.Ast.Scenario(scenarioData);
  });

  afterEach(function() {
    Cucumber.Ast.Step.restore();
    Cucumber.Ast.Tag.restore();
  });

  describe("constructor", function () {
    it('creates steps', function () {
      expect(Cucumber.Ast.Step).to.have.been.calledWith({step1: 'data'});
      expect(step1.setPreviousStep).to.have.been.calledWith(undefined);
      expect(step1.setScenario).to.have.been.calledWith(scenario);

      expect(Cucumber.Ast.Step).to.have.been.calledWith({step2: 'data'});
      expect(step2.setPreviousStep).to.have.been.calledWith(step1);
      expect(step2.setScenario).to.have.been.calledWith(scenario);
    });

    it('creates tags', function () {
      expect(Cucumber.Ast.Tag).to.have.been.calledWith({tag1: 'data'});
      expect(Cucumber.Ast.Tag).to.have.been.calledWith({tag2: 'data'});
    });
  });

  describe("getKeyword()", function () {
    var feature;

    beforeEach(function() {
      feature = createStubbedObject({getScenarioKeyword: 'keyword'});
      scenario.setFeature(feature);
    });

    it("returns the keyword of the scenario", function () {
      expect(scenario.getKeyword()).to.eql('keyword');
    });
  });

  describe("getName()", function () {
    it("returns the name of the scenario", function () {
      expect(scenario.getName()).to.eql('name');
    });
  });

  describe("getDescription()", function () {
    it("returns the description of the scenario", function () {
      expect(scenario.getDescription()).to.eql('description');
    });
  });

  describe("getUri()", function () {
    it("returns the URI on which the background starts", function () {
      expect(scenario.getUri()).to.eql('path');
    });
  });

  describe("getLine()", function () {
    it("returns the line on which the scenario starts", function () {
      expect(scenario.getLine()).to.eql(1);
    });
  });

  describe("getTags()", function () {
    it("returns the tags", function () {
      expect(scenario.getTags()).to.eql([tag1, tag2]);
    });
  });
});
