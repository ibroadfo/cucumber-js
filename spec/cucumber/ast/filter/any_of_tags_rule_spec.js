describe("Cucumber.Ast.Filter.AnyOfTagsRule", function () {
  var Cucumber = requireLib('cucumber');

  var rule;

  beforeEach(function () {
    var tags = ['tag1', 'tag2'];
    rule = Cucumber.Ast.Filter.AnyOfTagsRule(tags);
  });

  describe("isSatisfiedByElement()", function () {
    var element, spec1, spec2;

    beforeEach(function () {
      element = {};
      spec1 = createStubbedObject({isMatching: true});
      spec2 = createStubbedObject({isMatching: true});
      stub = sinon.stub(Cucumber.Ast.Filter, 'ElementMatchingTagSpec')
      stub.withArgs('tag1').returns(spec1);
      stub.withArgs('tag2').returns(spec2);
    });

    afterEach(function() {
      Cucumber.Ast.Filter.ElementMatchingTagSpec.restore();
    });

    describe('all tags match', function() {
      beforeEach(function () {
        spec1.isMatching.returns(true);
        spec2.isMatching.returns(true);
      });

      it("returns true", function () {
        expect(rule.isSatisfiedByElement(element)).to.be.true;
      });
    })

    describe('some tags match', function() {
      beforeEach(function () {
        spec1.isMatching.returns(true);
        spec2.isMatching.returns(false);
      });

      it("returns true", function () {
        expect(rule.isSatisfiedByElement(element)).to.be.true;
      });
    })

    describe('no tags match', function() {
      beforeEach(function () {
        spec1.isMatching.returns(false);
        spec2.isMatching.returns(false);
      });

      it("returns true", function () {
        expect(rule.isSatisfiedByElement(element)).to.be.false;
      });
    })
  });
});
