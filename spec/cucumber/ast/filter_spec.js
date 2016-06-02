describe("Cucumber.Ast.Filter", function () {
  var Cucumber = requireLib('cucumber');

  var filter;

  describe("isElementEnrolled()", function () {
    var scenario;

    beforeEach(function () {
      scenario = {};
    });

    describe('all rules are satisfied', function() {
      beforeEach(function() {
        var rules = [
          createStubbedObject({isSatisfiedByElement: true}),
          createStubbedObject({isSatisfiedByElement: true})
        ];
        filter = Cucumber.Ast.Filter(rules);
      });

      it("returns true", function () {
        var result = filter.isElementEnrolled(scenario);
        expect(result).to.be.true;
      });
    });

    describe('no rules are satisfied', function() {
      beforeEach(function() {
        var rules = [
          createStubbedObject({isSatisfiedByElement: false}),
          createStubbedObject({isSatisfiedByElement: false})
        ];
        filter = Cucumber.Ast.Filter(rules);
      });

      it("returns false", function () {
        var result = filter.isElementEnrolled(scenario);
        expect(result).to.be.false;
      });
    });

    describe('some rules are satisfied', function() {
      beforeEach(function() {
        var rules = [
          createStubbedObject({isSatisfiedByElement: true}),
          createStubbedObject({isSatisfiedByElement: false})
        ];
        filter = Cucumber.Ast.Filter(rules);
      });

      it("returns false", function () {
        var result = filter.isElementEnrolled(scenario);
        expect(result).to.be.false;
      });
    });
  });
});
