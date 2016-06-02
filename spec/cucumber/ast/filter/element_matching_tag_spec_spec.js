describe("Cucumber.Ast.Filter.ElementMatchingTagSpec", function () {
  var Cucumber = requireLib('cucumber');

  var spec, tag1, tag2, tag3;

  beforeEach(function() {
    tag1 = Cucumber.Ast.Tag({name: 'tag1'})
    tag2 = Cucumber.Ast.Tag({name: 'tag2'})
    tag3 = Cucumber.Ast.Tag({name: 'tag3'})
  })

  describe("isMatching()", function () {
    var element;

    beforeEach(function () {
      element = createStubbedObject({getTags: []});
    });

    describe('element has tag', function() {
      beforeEach(function() {
        spec = Cucumber.Ast.Filter.ElementMatchingTagSpec('tag1');
        element.getTags.returns([tag1, tag2])
      })

      it("returns true", function () {
        var result = spec.isMatching(element);
        expect(result).to.be.true;
      });
    });

    describe('element does not have tag', function() {
      beforeEach(function() {
        spec = Cucumber.Ast.Filter.ElementMatchingTagSpec('tag1');
        element.getTags.returns([tag2, tag3])
      })

      it("returns false", function () {
        var result = spec.isMatching(element);
        expect(result).to.be.false;
      });
    });

    describe('element has negated tag', function() {
      beforeEach(function() {
        spec = Cucumber.Ast.Filter.ElementMatchingTagSpec('~tag1');
        element.getTags.returns([tag1, tag2])
      })

      it("returns false", function () {
        var result = spec.isMatching(element);
        expect(result).to.be.false;
      });
    });

    describe('element does not have negated tag', function() {
      beforeEach(function() {
        spec = Cucumber.Ast.Filter.ElementMatchingTagSpec('~tag1');
        element.getTags.returns([tag2, tag3])
      })

      it("returns true", function () {
        var result = spec.isMatching(element);
        expect(result).to.be.true;
      });
    });
  });
});
