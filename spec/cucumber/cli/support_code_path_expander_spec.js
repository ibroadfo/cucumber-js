

describe("Cucumber.Cli.SupportCodePathExpander", function () {
  var Cucumber                = requireLib('cucumber');
  var SupportCodePathExpander = Cucumber.Cli.SupportCodePathExpander;
  var PathExpander            = Cucumber.Cli.PathExpander;

  describe("expandPaths()", function () {
    var paths, expandedPaths;

    beforeEach(function () {
      paths         = createSpy("unexpanded paths");
      expandedPaths = createSpy("expanded paths");
      sinon.stub(PathExpander, 'expandPathsWithExtensions').returns(expandedPaths);
    });

    it("asks the path expander to expand the paths with the glob matching the extensions", function () {
      SupportCodePathExpander.expandPaths(paths, ['js']);
      expect(PathExpander.expandPathsWithExtensions).to.have.been.calledWith(paths, ['js']);
    });

    it("asks the path expander to expand the paths with the glob matching the extensions (with a compiler)", function () {
      SupportCodePathExpander.expandPaths(paths, ['js', 'coffee']);
      expect(PathExpander.expandPathsWithExtensions).to.have.been.calledWith(paths, ['js', 'coffee']);
    });

    it("returns the expanded paths", function () {
      expect(SupportCodePathExpander.expandPaths(paths, ['js'])).to.equal(expandedPaths);
    });
  });
});
