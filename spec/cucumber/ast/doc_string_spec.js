describe("Cucumber.Ast.DocString", function () {
  var Cucumber = requireLib('cucumber');
  var docString;

  beforeEach(function () {
    docString = Cucumber.Ast.DocString({
      content: 'content',
      contentType: 'contentType',
      location: { line: 1 }
    });
  });

  describe("getContent()", function () {
    it("returns the content", function () {
      expect(docString.getContent()).to.eql('content');
    });
  });

  describe("getContentType()", function () {
    it("returns the doc", function () {
      expect(docString.getContentType()).to.eql('contentType');
    });
  });

  describe("getLine()", function () {
    it("returns the line", function () {
      expect(docString.getLine()).to.eql(1);
    });
  });
});
