describe("Cucumber", function () {
  var Cucumber = requireLib('cucumber');

  var featureSource, supportCodeInitializer, options, configuration, runtime;

  beforeEach(function () {
    featureSource = "feature source";
    supportCodeInitializer = "support code initializer";
    options = "options";
    configuration = "volatile configuration";
    runtime = "cucumber runtime";
    sinon.stub(Cucumber, 'VolatileConfiguration')
      .withArgs(featureSource, supportCodeInitializer, options)
      .returns(configuration);
    sinon.stub(Cucumber, 'Runtime')
      .withArgs(configuration)
      .returns(runtime);
  });

  afterEach(function() {
    Cucumber.VolatileConfiguration.restore()
    Cucumber.Runtime.restore()
  });

  it("returns the Cucumber runtime", function () {
    var cucumber = Cucumber(featureSource, supportCodeInitializer, options);
    expect(cucumber).to.eql(runtime);
  });
});
