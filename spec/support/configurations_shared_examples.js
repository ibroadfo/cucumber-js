global.itBehavesLikeAllCucumberConfigurations = function (context) {
  var configuration;

  beforeEach(function () {
    configuration = context.configuration;
  });

  it("supplies the feature sources", function () {
    expect(configuration.getFeatureSources).to.be.a('function');
  });

  it("supplies the support code library", function () {
    expect(configuration.getSupportCodeLibrary).to.be.a('function');
  });

  it("supplies the AST filter", function () {
    expect(configuration.getAstFilter).to.be.a('function');
  });
};
