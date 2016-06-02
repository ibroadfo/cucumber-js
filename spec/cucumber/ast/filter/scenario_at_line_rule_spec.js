describe("Cucumber.Ast.Filter.ScenarioAtLineRule", function () {
  var Cucumber = requireLib('cucumber');
  var fs = require('fs');

  var suppliedPaths;

  beforeEach(function () {
    suppliedPaths = ["supplied/path:1", "supplied/path:2", "other/supplied/path"];
    var originalRealPathSync = fs.realpathSync.bind(fs)
    sinon.stub(fs, 'realpathSync', function(filePath) {
      if (filePath === 'supplied/path') return '/real/path';
      if (filePath === 'other/supplied/path') return '/other/real/path';
      return originalRealPathSync(filePath)
    });
  });

  afterEach(function() {
    fs.realpathSync.restore();
  });

  describe("isSatisfiedByElement()", function () {
    var rule, element;

    beforeEach(function () {
      rule = Cucumber.Ast.Filter.ScenarioAtLineRule(suppliedPaths);
    });

    it("returns true if the uri and line match a supplied path", function(){
      element = createStubbedObject({getUri: '/real/path', getLines: [1]});
      expect(rule.isSatisfiedByElement(element)).to.equal(true);
    });

    it("returns true if the uri and scenario outline line match a supplied path", function(){
      element = createStubbedObject({getUri: '/real/path', getLines: [2]});
      expect(rule.isSatisfiedByElement(element)).to.equal(true);
    });

    it("returns false if the uri matches but the line does not", function(){
      element = createStubbedObject({getUri: '/real/path', getLines: [3]});
      expect(rule.isSatisfiedByElement(element)).to.equal(false);
    });

    it("returns false if the uri matches a supplied path that didn't specify a line", function(){
      element = createStubbedObject({getUri: '/other/real/path', getLines: [1]});
      expect(rule.isSatisfiedByElement(element)).to.equal(true);
    });
  });
});
