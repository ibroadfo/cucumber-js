describe("Cucumber.Cli.FeaturePathExpander", function () {
  var Cucumber            = requireLib('cucumber');
  var FeaturePathExpander = Cucumber.Cli.FeaturePathExpander;
  var PathExpander        = Cucumber.Cli.PathExpander;

  describe("expandPaths", function () {
    var paths, expandedPaths;

    beforeEach(function () {
      paths         = ['a', 'b:1'];
      expandedPaths = "expanded paths";
      sinon.stub(PathExpander, 'expandPathsWithExtensions')
        .withArgs(['a', 'b'], ['feature'])
        .returns(expandedPaths);
    });

    afterEach(function(){
      PathExpander.expandPathsWithExtensions.restore()
    })

    it("returns the expanded paths", function () {
      expect(FeaturePathExpander.expandPaths(paths)).to.equal(expandedPaths);
    });
  });
});
