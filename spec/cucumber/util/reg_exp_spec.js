

describe("Cucumber.Util.RegExp", function () {
  var Cucumber = requireLib('cucumber');

  describe("escapeString()", function () {
    var escapeString = Cucumber.Util.RegExp.escapeString;

    it("escapes dashes", function () {
      expect(escapeString("-")).to.equal("\\-");
    });

    it("escapes square brackets", function () {
      expect(escapeString("[]")).to.equal("\\[\\]");
    });

    it("escapes curly brackets", function () {
      expect(escapeString("{}")).to.equal("\\{\\}");
    });

    it("escapes parentheses", function () {
      expect(escapeString("()")).to.equal("\\(\\)");
    });

    it("escapes asterisks", function () {
      expect(escapeString("*")).to.equal("\\*");
    });

    it("escapes plusses", function () {
      expect(escapeString("+")).to.equal("\\+");
    });

    it("escapes question marks", function () {
      expect(escapeString("?")).to.equal("\\?");
    });

    it("escapes dots", function () {
      expect(escapeString(".")).to.equal("\\.");
    });

    it("escapes backslashes", function () {
      expect(escapeString("\\")).to.equal("\\\\");
    });

    it("escapes carets", function () {
      expect(escapeString("^")).to.equal("\\^");
    });

    it("escapes dollar signs", function () {
      expect(escapeString("$")).to.equal("\\$");
    });

    it("escapes pipes", function () {
      expect(escapeString("|")).to.equal("\\|");
    });

    it("escapes hashes", function () {
      expect(escapeString("#")).to.equal("\\#");
    });

    it("escapes new lines", function () {
      expect(escapeString("\n")).to.equal("\\\n");
    });

    it("escapes forward slashes", function () {
      expect(escapeString("/")).to.equal("\\/");
    });
  });
});
