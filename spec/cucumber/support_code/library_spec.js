

describe("Cucumber.SupportCode.Library", function () {
  var Cucumber = requireLib('cucumber');
  var library, rawSupportCode;

  beforeEach(function () {
    rawSupportCode = createSpy("Raw support code");
  });

  describe("constructor", function () {
    beforeEach(function () {
      sinon.stub(Cucumber.SupportCode, 'Hook');
      sinon.stub(Cucumber.SupportCode, 'StepDefinition');
      library = Cucumber.SupportCode.Library(rawSupportCode);
    });

    it("executes the raw support code", function () {
      expect(rawSupportCode).to.have.been.called;
    });

    it("executes the raw support code with a support code helper as 'this'", function () {
      expect(rawSupportCode.calls.mostRecent().object).toBeDefined();
    });

    describe("code support helper", function () {
      var supportCodeHelper;

      beforeEach(function () {
        supportCodeHelper = rawSupportCode.calls.mostRecent().object;
      });

      describe("Before", function () {
        var code, hook;

        beforeEach(function () {
          code = createSpy("hook code");
          hook = createSpy("hook");
          Cucumber.SupportCode.Hook.returns(hook);
        });

        describe("without options", function () {
          beforeEach(function () {
            supportCodeHelper.Before(code);
          });

          it("creates a before hook with the code", function () {
            expect(Cucumber.SupportCode.Hook).to.have.been.calledWith(code, {}, jasmine.any(String), jasmine.any(Number));
          });
        });

        describe("with options", function () {
          var options;

          beforeEach(function () {
            options = {some: 'data'};
            supportCodeHelper.Before(options, code);
          });

          it("creates a before hook with the code", function () {
            expect(Cucumber.SupportCode.Hook).to.have.been.calledWith(code, options, jasmine.any(String), jasmine.any(Number));
          });
        });

        describe("lookupBeforeHooksByScenario()", function () {
          var scenario, beforeHook1, beforeHook2, beforeHook3;

          beforeEach(function () {
            scenario = createSpy('scenario');
            beforeHook1 = createStubbedObject({appliesToScenario: true});
            beforeHook2 = createStubbedObject({appliesToScenario: false});
            beforeHook3 = createStubbedObject({appliesToScenario: true});
            Cucumber.SupportCode.Hook.and.returnValues(beforeHook1, beforeHook2, beforeHook3);
            supportCodeHelper.Before();
            supportCodeHelper.Before();
            supportCodeHelper.Before();
          });

          it("checks whether each before hook applies to the scenario", function () {
            library.lookupBeforeHooksByScenario(scenario);
            expect(beforeHook1.appliesToScenario).to.have.been.calledWith(scenario);
            expect(beforeHook2.appliesToScenario).to.have.been.calledWith(scenario);
            expect(beforeHook3.appliesToScenario).to.have.been.calledWith(scenario);
          });

          it("returns the matching hooks", function () {
            var result = library.lookupBeforeHooksByScenario(scenario);
            expect(result).to.eql([beforeHook1, beforeHook3]);
          });
        });
      });

      describe("After", function () {
        var code, hook;

        beforeEach(function () {
          code = createSpy("hook code");
          hook = createSpy("hook");
          Cucumber.SupportCode.Hook.returns(hook);
        });

        describe("without options", function () {
          beforeEach(function () {
            supportCodeHelper.After(code);
          });

          it("creates a before hook with the code", function () {
            expect(Cucumber.SupportCode.Hook).to.have.been.calledWith(code, {}, jasmine.any(String), jasmine.any(Number));
          });
        });

        describe("with a tag group", function () {
          var options;

          beforeEach(function () {
            options = {some: 'data'};
            supportCodeHelper.After(options, code);
          });

          it("creates a before hook with the code", function () {
            expect(Cucumber.SupportCode.Hook).to.have.been.calledWith(code, options, jasmine.any(String), jasmine.any(Number));
          });
        });

        describe("lookupAfterHooksByScenario()", function () {
          var scenario, afterHook1, afterHook2, afterHook3;

          beforeEach(function () {
            scenario = createSpy('scenario');
            afterHook1 = createStubbedObject({appliesToScenario: true});
            afterHook2 = createStubbedObject({appliesToScenario: false});
            afterHook3 = createStubbedObject({appliesToScenario: true});
            Cucumber.SupportCode.Hook.and.returnValues(afterHook1, afterHook2, afterHook3);
            supportCodeHelper.After();
            supportCodeHelper.After();
            supportCodeHelper.After();
          });

          it("checks whether each after hook applies to the scenario", function () {
            library.lookupAfterHooksByScenario(scenario);
            expect(afterHook1.appliesToScenario).to.have.been.calledWith(scenario);
            expect(afterHook2.appliesToScenario).to.have.been.calledWith(scenario);
            expect(afterHook3.appliesToScenario).to.have.been.calledWith(scenario);
          });

          it("returns the matching hooks", function () {
            var result = library.lookupAfterHooksByScenario(scenario);
            expect(result).to.eql([afterHook1, afterHook3]);
          });
        });
      });

      it("exposes a method to define Given steps", function () {
        expect(supportCodeHelper.Given).toBeAFunction ();
        expect(supportCodeHelper.Given).to.equal(supportCodeHelper.defineStep);
      });

      it("exposes a method to define When steps", function () {
        expect(supportCodeHelper.When).toBeAFunction ();
        expect(supportCodeHelper.Given).to.equal(supportCodeHelper.defineStep);
      });

      it("exposes a method to define Then steps", function () {
        expect(supportCodeHelper.Then).toBeAFunction ();
        expect(supportCodeHelper.Given).to.equal(supportCodeHelper.defineStep);
      });

      it("exposes a method to define any step", function () {
        expect(supportCodeHelper.defineStep).toBeAFunction ();
        expect(supportCodeHelper.defineStep).to.equal(library.defineStep);
      });

      it("exposes the World constructor", function () {
        expect(supportCodeHelper.World).toBeAFunction();
      });

      it("exposes a method to register a listener", function () {
        expect(supportCodeHelper.registerListener).toBeAFunction();
      });

      it("exposes a method to register a handler", function () {
        expect(supportCodeHelper.registerHandler).toBeAFunction();
      });

      // parameterized test
      for (var eventName in Cucumber.Listener.Events) {
        if(!Cucumber.Listener.Events.hasOwnProperty(eventName))
          continue;

        /* jshint -W083 */
        describe(eventName + ' event register handler method', function () {
          beforeEach(function () {
            sinon.stub(library, 'registerHandler');
          });

          it("is defined as a function", function () {
            expect(supportCodeHelper[eventName]).toBeAFunction ();
          });

          it("calls registerHandler with the eventName", function () {
            var handler = createSpy('handler');
            supportCodeHelper[eventName](handler);
            expect(library.registerHandler).to.have.been.called;
            expect(library.registerHandler).toHaveBeenCalledWithValueAsNthParameter(eventName, 1);
            expect(library.registerHandler).toHaveBeenCalledWithValueAsNthParameter(handler, 2);
          });
        });
        /* jshint +W083 */
      }
    });
  });

  describe('Step Definitions', function () {
    describe("lookupStepDefinitionsByName()", function () {
      var stepName, stepDefinition1, stepDefinition2, stepDefinition3;

      beforeEach(function () {
        stepName = 'step name';
        stepDefinition1 = createStubbedObject({matchesStepName: false});
        stepDefinition2 = createStubbedObject({matchesStepName: true});
        stepDefinition3 = createStubbedObject({matchesStepName: true});
        sinon.stub(Cucumber.SupportCode, 'StepDefinition').and.returnValues(stepDefinition1, stepDefinition2, stepDefinition3);
        library.defineStep();
        library.defineStep();
        library.defineStep();
      });

      it("checks whether each step defintion matches the step name", function () {
        library.lookupStepDefinitionsByName(stepName);
        expect(stepDefinition1.matchesStepName).to.have.been.calledWith(stepName);
        expect(stepDefinition2.matchesStepName).to.have.been.calledWith(stepName);
        expect(stepDefinition3.matchesStepName).to.have.been.calledWith(stepName);
      });

      it("returns the matching hooks", function () {
        var result = library.lookupStepDefinitionsByName(stepName);
        expect(result).to.eql([stepDefinition2, stepDefinition3]);
      });
    });

    describe("defineStep()", function () {
      var name, code, stepDefinition;

      beforeEach(function () {
        name           = createSpy("step definition name");
        code           = createSpy("step definition code");
        stepDefinition = createSpy("step definition");
        sinon.stub(Cucumber.SupportCode, 'StepDefinition').returns(stepDefinition);
      });

      describe('without options', function () {
        beforeEach(function () {
          library.defineStep(name, code);
        });

        it("creates a step definition with the name, empty options, and code", function () {
          expect(Cucumber.SupportCode.StepDefinition).to.have.been.calledWith(name, {}, code, jasmine.any(String), jasmine.any(Number));
        });
      });

      describe('with options', function () {
        var options;

        beforeEach(function () {
          options = {some: 'data'};
          library.defineStep(name, options, code);
        });

        it("creates a step definition with the name, options, and code", function () {
          expect(Cucumber.SupportCode.StepDefinition).to.have.been.calledWith(name, options, code, jasmine.any(String), jasmine.any(Number));
        });
      });
    });
  });

  describe('Listener Support', function () {
    beforeEach(function () {
      library = Cucumber.SupportCode.Library(rawSupportCode);
    });

    describe('getListeners()', function () {
      describe('without any listeners registered', function () {
        it("returns an empty array", function () {
          expect(library.getListeners()).to.eql([]);
        });
      });

      describe('with a listeners registered', function () {
        var listener;

        beforeEach(function () {
          listener = createSpy('sample listener');
          library.registerListener(listener);
        });

        it("returns the registered listeners", function () {
          expect(library.getListeners()).to.eql([listener]);
        });
      });
    });

    describe('registerHandler()', function () {
      var eventName, handler, listener;

      beforeEach(function () {
        eventName = 'eventName';
        handler = createSpy('sampleHandler');
        listener = createStubbedObject("listener",  {setHandlerForEvent: null});
        sinon.stub(Cucumber, 'Listener').returns(listener);
        sinon.stub(library, 'registerListener');
        library.registerHandler(eventName, handler);
      });

      it('creates a listener to the listener collection', function () {
        expect(listener.setHandlerForEvent).toHaveBeenCalledWithValueAsNthParameter(eventName, 1);
        expect(listener.setHandlerForEvent).toHaveBeenCalledWithValueAsNthParameter(handler, 2);
      });

      it("registers the listener", function () {
        expect(library.registerListener).to.have.been.calledWith(listener);
      });
    });
  });

  describe('World construction', function () {
    beforeEach(function () {
      library = Cucumber.SupportCode.Library(rawSupportCode);
    });

    describe("instantiateNewWorld()", function () {
      it("creates a new instance of the World", function () {
        var world = library.instantiateNewWorld();
        expect(typeof world).to.equal('object');
      });
    });

    describe("when the default World constructor is replaced by a custom one", function () {
      it("instantiates a custom World", function () {
        var customWorldConstructor = function () {};
        rawSupportCode             = function () { this.World = customWorldConstructor; };
        library                    = Cucumber.SupportCode.Library(rawSupportCode);

        var world = library.instantiateNewWorld();
        expect(world.constructor).to.equal(customWorldConstructor);
      });
    });
  });
});
