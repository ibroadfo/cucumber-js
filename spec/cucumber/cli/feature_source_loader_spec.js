describe("Cucumber.Cli.FeatureSourceLoader", function () {
  var Cucumber = requireLib('cucumber');

  var featureSourceLoader, featureFilePaths;

  beforeEach(function () {
    featureFilePaths = ["first feature file path", "second feature file path"];
    featureSourceLoader = Cucumber.Cli.FeatureSourceLoader(featureFilePaths);
  });

  describe("getSources()", function () {
    var fs = require('fs');

    var featureSources, namedFeatureSources;

    beforeEach(function () {
      featureSources      = ["feature source 1", "feature source 2"];
      namedFeatureSources = [[featureFilePaths[0], featureSources[0]],
                             [featureFilePaths[1], featureSources[1]]];
      sinon.stub(fs, 'readFileSync')
        .onCall(0).returns(featureSources[0])
        .onCall(1).returns(featureSources[1]);
    });

    afterEach(function() {
      fs.readFileSync.restore();
    });

    it("gets the source from each feature file", function () {
      featureSourceLoader.getSources();
      featureFilePaths.forEach(function (featureFilePath) {
        expect(fs.readFileSync).to.have.been.calledWith(featureFilePath, 'utf8');
      });
    });

    it("returns the loaded sources", function () {
      expect(featureSourceLoader.getSources()).to.eql(namedFeatureSources);
    });
  });
});
