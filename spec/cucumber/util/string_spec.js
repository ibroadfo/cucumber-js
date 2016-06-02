

describe("Cucumber.Util.String", function () {
  var Cucumber = requireLib('cucumber');

  describe("count()", function () {
    it("returns 0 when the needle is not found", function () {
      var count = Cucumber.Util.String.count("cucumber", "a");
      expect(count).to.equal(0);
    });

    it("returns 1 when the needle was found once", function () {
      var count = Cucumber.Util.String.count("cucumber", "b");
      expect(count).to.equal(1);
    });

    it("returns 2 when the needle was found twice", function () {
      var count = Cucumber.Util.String.count("cucumber", "c");
      expect(count).to.equal(2);
    });
  });
});
