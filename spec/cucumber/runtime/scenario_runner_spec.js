

describe("Cucumber.Runtime.ScenarioRunner", function () {
  var Cucumber = requireLib('cucumber');
  var supportCodeLibrary, eventBroadcaster, options, world, defaultTimeout, scenario, scenarioRunner;

  beforeEach(function () {
    world = createSpy('world');
    defaultTimeout = createSpy('defaultTimeout');
    scenario = createStubbedObject({
      getSteps: []
    });
    supportCodeLibrary = createStubbedObject({
      getDefaultTimeout: defaultTimeout,
      instantiateNewWorld: world,
      lookupBeforeHooksByScenario: [],
      lookupAfterHooksByScenario: [],
      lookupStepDefinitionsByName: []
    });
    eventBroadcaster = createStubbedObject({broadcastEvent: null, broadcastAroundEvent: null});
    eventBroadcaster.broadcastAroundEvent.and.callFake(function(event, userFunction, callback) {
      userFunction(function(){
        callback.apply(null, arguments);
      });
    });
    eventBroadcaster.broadcastEvent.and.callFake(function(event, callback) {
      callback();
    });
    options = {};
    scenarioRunner = Cucumber.Runtime.ScenarioRunner(scenario, supportCodeLibrary, eventBroadcaster, options);
  });

  describe("run()", function () {
    var result;

    describe("with no steps or hooks", function() {
      beforeEach(function(done) {
        scenarioRunner.run(function(value) {
          result = value;
          done();
        });
      });

      it('broadcasts a scenario event', function() {
        expect(eventBroadcaster.broadcastAroundEvent).toHaveBeenCalledTimes(1);
        var event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(0)[0];
        expect(event.getName()).to.eql(Cucumber.Events.SCENARIO_EVENT_NAME);
        expect(event.getPayloadItem('scenario')).to.eql(scenario);
      });

      it('returns a passing result', function() {
        expect(result.getStatus()).to.eql(Cucumber.Status.PASSED);
      });
    });

    describe("with a passing step", function() {
      var step, stepDefinition, stepResult;

      beforeEach(function(done) {
        step = Cucumber.Ast.Step({});
        stepResult = Cucumber.Runtime.StepResult({duration: 1, status: Cucumber.Status.PASSED, step: step});
        stepDefinition = createStubbedObject('stepDefinition', {invoke: null});
        stepDefinition.invoke.and.callFake(function(){ arguments[4](stepResult); });
        supportCodeLibrary.lookupStepDefinitionsByName.returns([stepDefinition]);
        scenario.getSteps.returns([step]);
        scenarioRunner.run(function(value) {
          result = value;
          done();
        });
      });

      it('broadcasts a scenario, step, stepResult and scenarioResult event', function() {
        expect(eventBroadcaster.broadcastAroundEvent).toHaveBeenCalledTimes(2);
        expect(eventBroadcaster.broadcastEvent).toHaveBeenCalledTimes(2);

        var event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(0)[0];
        expect(event.getName()).to.eql(Cucumber.Events.SCENARIO_EVENT_NAME);
        expect(event.getPayloadItem('scenario')).to.eql(scenario);

        event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(1)[0];
        expect(event.getName()).to.eql(Cucumber.Events.STEP_EVENT_NAME);
        expect(event.getPayloadItem('step')).to.eql(step);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(0)[0];
        expect(event.getName()).to.eql(Cucumber.Events.STEP_RESULT_EVENT_NAME);
        expect(event.getPayloadItem('stepResult')).to.eql(stepResult);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(1)[0];
        expect(event.getName()).to.eql(Cucumber.Events.SCENARIO_RESULT_EVENT_NAME);
        expect(event.getPayloadItem('scenarioResult')).to.eql(result);
      });

      it('returns a passing result', function() {
        expect(result.getStatus()).to.eql(Cucumber.Status.PASSED);
      });
    });

    describe("with a failing step", function() {
      var step, stepDefinition, stepResult;

      beforeEach(function(done) {
        step = Cucumber.Ast.Step({});
        stepResult = Cucumber.Runtime.StepResult({duration: 1, status: Cucumber.Status.FAILED, step: step});
        stepDefinition = createStubbedObject('stepDefinition', {invoke: null});
        stepDefinition.invoke.and.callFake(function(){ arguments[4](stepResult); });
        supportCodeLibrary.lookupStepDefinitionsByName.returns([stepDefinition]);
        scenario.getSteps.returns([step]);
        scenarioRunner.run(function(value) {
          result = value;
          done();
        });
      });

      it('broadcasts a scenario, step and stepResult event', function() {
        expect(eventBroadcaster.broadcastAroundEvent).toHaveBeenCalledTimes(2);
        expect(eventBroadcaster.broadcastEvent).toHaveBeenCalledTimes(2);

        var event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(0)[0];
        expect(event.getName()).to.eql(Cucumber.Events.SCENARIO_EVENT_NAME);
        expect(event.getPayloadItem('scenario')).to.eql(scenario);

        event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(1)[0];
        expect(event.getName()).to.eql(Cucumber.Events.STEP_EVENT_NAME);
        expect(event.getPayloadItem('step')).to.eql(step);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(0)[0];
        expect(event.getName()).to.eql(Cucumber.Events.STEP_RESULT_EVENT_NAME);
        expect(event.getPayloadItem('stepResult')).to.eql(stepResult);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(1)[0];
        expect(event.getName()).to.eql(Cucumber.Events.SCENARIO_RESULT_EVENT_NAME);
        expect(event.getPayloadItem('scenarioResult')).to.eql(result);
      });

      it('returns a failed result', function() {
        expect(result.getStatus()).to.eql(Cucumber.Status.FAILED);
      });
    });

    describe("with an ambiguous step", function() {
      var step, stepDefinitions;

      beforeEach(function(done) {
        step = Cucumber.Ast.Step({});
        stepDefinitions = [createSpy('stepDefinition1'), createSpy('stepDefinition2')];
        supportCodeLibrary.lookupStepDefinitionsByName.returns(stepDefinitions);
        scenario.getSteps.returns([step]);
        scenarioRunner.run(function(value) {
          result = value;
          done();
        });
      });

      it('broadcasts a scenario, step and stepResult event', function() {
        expect(eventBroadcaster.broadcastAroundEvent).toHaveBeenCalledTimes(2);
        expect(eventBroadcaster.broadcastEvent).toHaveBeenCalledTimes(2);

        var event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(0)[0];
        expect(event.getName()).to.eql(Cucumber.Events.SCENARIO_EVENT_NAME);
        expect(event.getPayloadItem('scenario')).to.eql(scenario);

        event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(1)[0];
        expect(event.getName()).to.eql(Cucumber.Events.STEP_EVENT_NAME);
        expect(event.getPayloadItem('step')).to.eql(step);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(0)[0];
        expect(event.getName()).to.eql(Cucumber.Events.STEP_RESULT_EVENT_NAME);
        var stepResult = event.getPayloadItem('stepResult');
        expect(stepResult.getStatus()).to.eql(Cucumber.Status.AMBIGUOUS);
        expect(stepResult.getAmbiguousStepDefinitions()).to.eql(stepDefinitions);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(1)[0];
        expect(event.getName()).to.eql(Cucumber.Events.SCENARIO_RESULT_EVENT_NAME);
        expect(event.getPayloadItem('scenarioResult')).to.eql(result);
      });

      it('returns a failed result', function() {
        expect(result.getStatus()).to.eql(Cucumber.Status.AMBIGUOUS);
      });
    });

    describe("with an undefined step", function() {
      var step;

      beforeEach(function(done) {
        step = Cucumber.Ast.Step({});
        scenario.getSteps.returns([step]);
        scenarioRunner.run(function(value) {
          result = value;
          done();
        });
      });

      it('broadcasts a scenario, step and stepResult event', function() {
        expect(eventBroadcaster.broadcastAroundEvent).toHaveBeenCalledTimes(2);
        expect(eventBroadcaster.broadcastEvent).toHaveBeenCalledTimes(2);

        var event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(0)[0];
        expect(event.getName()).to.eql(Cucumber.Events.SCENARIO_EVENT_NAME);
        expect(event.getPayloadItem('scenario')).to.eql(scenario);

        event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(1)[0];
        expect(event.getName()).to.eql(Cucumber.Events.STEP_EVENT_NAME);
        expect(event.getPayloadItem('step')).to.eql(step);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(0)[0];
        expect(event.getName()).to.eql(Cucumber.Events.STEP_RESULT_EVENT_NAME);
        var stepResult = event.getPayloadItem('stepResult');
        expect(stepResult.getStatus()).to.eql(Cucumber.Status.UNDEFINED);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(1)[0];
        expect(event.getName()).to.eql(Cucumber.Events.SCENARIO_RESULT_EVENT_NAME);
        expect(event.getPayloadItem('scenarioResult')).to.eql(result);
      });

      it('returns a failed result', function() {
        expect(result.getStatus()).to.eql(Cucumber.Status.UNDEFINED);
      });
    });

    describe("with an passing step in dry run mode", function() {
      var step, stepDefinition;

      beforeEach(function(done) {
        options.dryRun = true;
        step = Cucumber.Ast.Step({});
        stepDefinition = createSpy('stepDefinition');
        supportCodeLibrary.lookupStepDefinitionsByName.returns([stepDefinition]);
        scenario.getSteps.returns([step]);
        scenarioRunner.run(function(value) {
          result = value;
          done();
        });
      });

      it('broadcasts a scenario, step and stepResult event', function() {
        expect(eventBroadcaster.broadcastAroundEvent).toHaveBeenCalledTimes(2);
        expect(eventBroadcaster.broadcastEvent).toHaveBeenCalledTimes(2);

        var event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(0)[0];
        expect(event.getName()).to.eql(Cucumber.Events.SCENARIO_EVENT_NAME);
        expect(event.getPayloadItem('scenario')).to.eql(scenario);

        event = eventBroadcaster.broadcastAroundEvent.calls.argsFor(1)[0];
        expect(event.getName()).to.eql(Cucumber.Events.STEP_EVENT_NAME);
        expect(event.getPayloadItem('step')).to.eql(step);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(0)[0];
        expect(event.getName()).to.eql(Cucumber.Events.STEP_RESULT_EVENT_NAME);
        var stepResult = event.getPayloadItem('stepResult');
        expect(stepResult.getStatus()).to.eql(Cucumber.Status.SKIPPED);

        event = eventBroadcaster.broadcastEvent.calls.argsFor(1)[0];
        expect(event.getName()).to.eql(Cucumber.Events.SCENARIO_RESULT_EVENT_NAME);
        expect(event.getPayloadItem('scenarioResult')).to.eql(result);
      });

      it('returns a failed result', function() {
        expect(result.getStatus()).to.eql(Cucumber.Status.SKIPPED);
      });
    });
  });
});
