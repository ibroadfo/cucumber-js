

describe("Cucumber.Ast.Step", function () {
  var Cucumber = requireLib('cucumber');
  var step, feature;

  beforeEach(function () {
    var stepData = {
      locations: [{line: 1}, {line: 2}],
      text: 'text',
      path: 'path'
    };
    step = Cucumber.Ast.Step(stepData);

    feature = createStubbedObject({getStepKeywordByLines: 'keyword'});
    var scenario = createStubbedObject({getFeature: feature});
    step.setScenario(scenario);
  });

  describe("getKeyword()", function () {
    it("returns the keyword of the step", function () {
      expect(step.getKeyword()).to.eql('keyword');
    });
  });

  describe("getName()", function () {
    it("returns the name of the step", function () {
      expect(step.getName()).to.eql('text');
    });
  });

  describe("isHidden()", function () {
    it("returns false for a non hook step", function () {
      expect(step.isHidden()).to.equal(false);
    });
  });

  describe("hasUri()", function () {
    it("returns true", function () {
      expect(step.hasUri()).to.equal(true);
    });
  });

  describe("getLine()", function () {
    it("returns the last line number", function () {
      expect(step.getLine()).to.eql(2);
    });
  });

  describe("getLines()", function () {
    it("returns all the line numbers", function () {
      expect(step.getLines()).to.eql([1, 2]);
    });
  });

  describe("hasPreviousStep() [setPreviousStep()]", function () {
    it("returns true when a previous step was set", function () {
      var previousStep = "previous step";
      step.setPreviousStep(previousStep);
      expect(step.hasPreviousStep()).to.equal(true);
    });

    it("returns false when no previous step was set", function () {
      expect(step.hasPreviousStep()).to.equal(false);
    });
  });

  describe("getPreviousStep() [setPreviousStep()]", function () {
    it("returns the previous step that was set as such", function () {
      var previousStep = "previous step";
      step.setPreviousStep(previousStep);
      expect(step.getPreviousStep()).to.equal(previousStep);
    });
  });

  describe("isOutcomeStep()", function () {
    beforeEach(function () {
      sinon.stub(step, 'hasOutcomeStepKeyword');
      sinon.stub(step, 'isRepeatingOutcomeStep');
    });

    it("checks whether the keyword is an outcome step keyword", function () {
      step.isOutcomeStep();
      expect(step.hasOutcomeStepKeyword).to.have.been.called;
    });

    it("is truthy when the keyword is an outcome step keyword", function () {
      step.hasOutcomeStepKeyword.returns(true);
      expect(step.isOutcomeStep()).to.be.ok;
    });

    describe("when the keyword is not an outcome step keyword", function () {
      beforeEach(function () {
        step.hasOutcomeStepKeyword.returns(false);
      });

      it("checks whether the keyword is repeating an outcome step", function () {
        step.isOutcomeStep();
        expect(step.isRepeatingOutcomeStep).to.have.been.called;
      });

      it("it is true when the step is repeating an outcome step", function () {
        step.isRepeatingOutcomeStep.returns(true);
        expect(step.isOutcomeStep()).to.equal(true);
      });
    });
  });

  describe("isEventStep()", function () {
    beforeEach(function () {
      sinon.stub(step, 'hasEventStepKeyword');
      sinon.stub(step, 'isRepeatingEventStep');
    });

    it("checks whether the keyword is an event step keyword", function () {
      step.isEventStep();
      expect(step.hasEventStepKeyword).to.have.been.called;
    });

    it("is truthy when the keyword is an event step keyword", function () {
      step.hasEventStepKeyword.returns(true);
      expect(step.isEventStep()).to.be.ok;
    });

    describe("when the keyword is not an event step keyword", function () {
      beforeEach(function () {
        step.hasEventStepKeyword.returns(false);
      });

      it("checks whether the keyword is repeating an event step", function () {
        step.isEventStep();
        expect(step.isRepeatingEventStep).to.have.been.called;
      });

      it("it is true when the step is repeating an event step", function () {
        step.isRepeatingEventStep.returns(true);
        expect(step.isEventStep()).to.be.ok;
      });
    });
  });

  describe("hasOutcomeStepKeyword()", function () {
    it("returns true when the keyword is 'Then '", function () {
      feature.getStepKeywordByLines.returns('Then ');
      expect(step.hasOutcomeStepKeyword()).to.be.ok;
    });

    it("returns false when the keyword is not 'Then '", function () {
      expect(step.hasOutcomeStepKeyword()).not.to.be.ok;
    });
  });

  describe("hasEventStepKeyword()", function () {
    it("returns true when the keyword is 'When '", function () {
      feature.getStepKeywordByLines.returns('When ');
      expect(step.hasEventStepKeyword()).to.be.ok;
    });

    it("returns false when the keyword is not 'When '", function () {
      expect(step.hasEventStepKeyword()).not.to.be.ok;
    });
  });

  describe("isRepeatingOutcomeStep()", function () {
    beforeEach(function () {
      sinon.stub(step, 'hasRepeatStepKeyword');
      sinon.stub(step, 'isPrecededByOutcomeStep');
    });

    it("checks whether the keyword is a repeating keyword", function () {
      step.isRepeatingOutcomeStep();
      expect(step.hasRepeatStepKeyword).to.have.been.called;
    });

    describe("when the keyword is a repeating keyword", function () {
      beforeEach(function () {
        step.hasRepeatStepKeyword.returns(true);
      });

      it("checks whether the preceding step is an outcome step", function () {
        step.isRepeatingOutcomeStep();
        expect(step.isPrecededByOutcomeStep).to.have.been.called;
      });

      describe("when the step is preceded by an outcome step", function () {
        beforeEach(function () {
          step.isPrecededByOutcomeStep.returns(true);
        });

        it("returns true", function () {
          expect(step.isRepeatingOutcomeStep()).to.equal(true);
        });
      });

      describe("when the step is not preceded by an outcome step", function () {
        beforeEach(function () {
          step.isPrecededByOutcomeStep.returns(false);
        });

        it("returns false", function () {
          expect(step.isRepeatingOutcomeStep()).to.equal(false);
        });
      });
    });

    describe("when the keyword is not a repeating keyword", function () {
      beforeEach(function () {
        step.hasRepeatStepKeyword.returns(false);
      });

      it("does not check whether the preceding step is an outcome step", function () {
        step.isRepeatingOutcomeStep();
        expect(step.isPrecededByOutcomeStep).not.to.have.been.called;
      });

      it("returns false", function () {
        expect(step.isRepeatingOutcomeStep()).to.equal(false);
      });
    });
  });

  describe("isRepeatingEventStep()", function () {
    beforeEach(function () {
      sinon.stub(step, 'hasRepeatStepKeyword');
      sinon.stub(step, 'isPrecededByEventStep');
    });

    it("checks whether the keyword is a repeating keyword", function () {
      step.isRepeatingEventStep();
      expect(step.hasRepeatStepKeyword).to.have.been.called;
    });

    describe("when the keyword is a repeating keyword", function () {
      beforeEach(function () {
        step.hasRepeatStepKeyword.returns(true);
      });

      it("checks whether the preceding step is an event step", function () {
        step.isRepeatingEventStep();
        expect(step.isPrecededByEventStep).to.have.been.called;
      });

      describe("when the step is preceded by an event step", function () {
        beforeEach(function () {
          step.isPrecededByEventStep.returns(true);
        });

        it("returns true", function () {
          expect(step.isRepeatingEventStep()).to.equal(true);
        });
      });

      describe("when the step is not preceded by an event step", function () {
        beforeEach(function () {
          step.isPrecededByEventStep.returns(false);
        });

        it("returns false", function () {
          expect(step.isRepeatingEventStep()).to.equal(false);
        });
      });
    });

    describe("when the keyword is not a repeating keyword", function () {
      beforeEach(function () {
        step.hasRepeatStepKeyword.returns(false);
      });

      it("does not check whether the preceding step is an event step", function () {
        step.isRepeatingEventStep();
        expect(step.isPrecededByEventStep).not.to.have.been.called;
      });

      it("returns false", function () {
        expect(step.isRepeatingEventStep()).to.equal(false);
      });
    });
  });

  describe("hasRepeatStepKeyword()", function () {
    it("returns true when the keyword is 'And '", function () {
      feature.getStepKeywordByLines.returns('And ');
      expect(step.hasRepeatStepKeyword()).to.be.ok;
    });

    it("returns true when the keyword is 'But '", function () {
      feature.getStepKeywordByLines.returns('But ');
      expect(step.hasRepeatStepKeyword()).to.be.ok;
    });

    it("returns true when the keyword is '* '", function () {
      feature.getStepKeywordByLines.returns('* ');
      expect(step.hasRepeatStepKeyword()).to.be.ok;
    });

    it("returns false when the keyword is not 'And ' nor 'But '", function () {
      expect(step.hasRepeatStepKeyword()).to.equal(false);
    });
  });

  describe("isPrecededByOutcomeStep()", function () {
    beforeEach(function () {
      sinon.stub(step, 'hasPreviousStep');
    });

    it("checks whether there is a previous step or not", function () {
      step.isPrecededByOutcomeStep();
      expect(step.hasPreviousStep).to.have.been.called;
    });

    describe("when there are no previous steps", function () {
      beforeEach(function () {
        step.hasPreviousStep.returns(false);
      });

      it("is falsy", function () {
        expect(step.isPrecededByOutcomeStep()).not.to.be.ok;
      });
    });

    describe("when there is a previous step", function () {
      var previousStep;

      beforeEach(function () {
        step.hasPreviousStep.returns(true);
        previousStep = createStubbedObject({isOutcomeStep: null});
        sinon.stub(step, 'getPreviousStep').returns(previousStep);
      });

      it("gets the previous step", function () {
        step.isPrecededByOutcomeStep();
        expect(step.getPreviousStep).to.have.been.called;
      });

      it("checks whether the previous step is an outcome step or not", function () {
        step.isPrecededByOutcomeStep();
        expect(previousStep.isOutcomeStep).to.have.been.called;
      });

      describe("when the previous step is an outcome step", function () {
        beforeEach(function () {
          previousStep.isOutcomeStep.returns(true);
        });

        it("is truthy", function () {
          expect(step.isPrecededByOutcomeStep()).to.be.ok;
        });
      });

      describe("when the previous step is not an outcome step", function () {
        beforeEach(function () {
          previousStep.isOutcomeStep.returns(false);
        });

        it("is falsy", function () {
          expect(step.isPrecededByOutcomeStep()).not.to.be.ok;
        });
      });
    });
  });

  describe("isPrecededByEventStep()", function () {
    beforeEach(function () {
      sinon.stub(step, 'hasPreviousStep');
    });

    it("checks whether there is a previous step or not", function () {
      step.isPrecededByEventStep();
      expect(step.hasPreviousStep).to.have.been.called;
    });

    describe("when there are no previous steps", function () {
      beforeEach(function () {
        step.hasPreviousStep.returns(false);
      });

      it("is falsy", function () {
        expect(step.isPrecededByEventStep()).not.to.be.ok;
      });
    });

    describe("when there is a previous step", function () {
      var previousStep;

      beforeEach(function () {
        step.hasPreviousStep.returns(true);
        previousStep = createStubbedObject({isEventStep: null});
        sinon.stub(step, 'getPreviousStep').returns(previousStep);
      });

      it("gets the previous step", function () {
        step.isPrecededByEventStep();
        expect(step.getPreviousStep).to.have.been.called;
      });

      it("checks whether the previous step is an event step or not", function () {
        step.isPrecededByEventStep();
        expect(previousStep.isEventStep).to.have.been.called;
      });

      describe("when the previous step is an event step", function () {
        beforeEach(function () {
          previousStep.isEventStep.returns(true);
        });

        it("is truthy", function () {
          expect(step.isPrecededByEventStep()).to.be.ok;
        });
      });

      describe("when the previous step is not an event step", function () {
        beforeEach(function () {
          previousStep.isEventStep.returns(false);
        });

        it("is falsy", function () {
          expect(step.isPrecededByEventStep()).not.to.be.ok;
        });
      });
    });
  });
});
