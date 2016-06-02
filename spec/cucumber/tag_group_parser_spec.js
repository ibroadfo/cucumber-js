require('../support/spec_helper');

describe("Cucumber.TagGroupParser", function () {
  var Cucumber = requireLib('cucumber');

  describe("parse()", function () {
    it("splits two tags based on the separator", function () {
      var tagGroupParser = Cucumber.TagGroupParser("@foo,@bar");
      var parsed         = tagGroupParser.parse();
      expect(parsed).to.eql(["@foo", "@bar"]);
    });

    it("splits three tags based on the separator", function () {
      var tagGroupParser = Cucumber.TagGroupParser("@foo,@bar,@baz");
      var parsed         = tagGroupParser.parse();
      expect(parsed).to.eql(["@foo", "@bar", "@baz"]);
    });

    it("splits negative tags based on the separator", function () {
      var tagGroupParser = Cucumber.TagGroupParser("@foo,~@bar,@baz");
      var parsed         = tagGroupParser.parse();
      expect(parsed).to.eql(["@foo", "~@bar", "@baz"]);
    });

    it("removes leading and trailing whitespaces", function () {
      var tagGroupParser = Cucumber.TagGroupParser("\t  @foo, ~@bar ,\n @baz ");
      var parsed         = tagGroupParser.parse();
      expect(parsed).to.eql(["@foo", "~@bar", "@baz"]);
    });
  });

  describe(".getTagGroupsFromStrings()", function () {
    var tagGroups, tagGroupParsers, tagGroupStrings, getTagGroupsFromStringsFunc;

    beforeEach(function () {
      getTagGroupsFromStringsFunc = Cucumber.TagGroupParser.getTagGroupsFromStrings;
      tagGroupStrings             = [createSpy("first tag group string"), createSpy("second tag group string"), createSpy("third tag group string")];
      tagGroups                   = [createSpy("first tag group"), createSpy("second tag group"), createSpy("third tag group")];
      tagGroupParsers             = [createStubbedObject({parse: tagGroups[0]}),
                                     createStubbedObject({parse: tagGroups[1]}),
                                     createStubbedObject({parse: tagGroups[2]})];
      sinon.stub(Cucumber, 'TagGroupParser').and.returnValues.apply(null, tagGroupParsers);
    });

    it("creates a TagGroupParser instance for each tag group string", function () {
      getTagGroupsFromStringsFunc(tagGroupStrings);
      tagGroupStrings.forEach(function (tagGroupString) {
        expect(Cucumber.TagGroupParser).to.have.been.calledWith(tagGroupString);
      });
    });

    it("gets the parsed tag groups", function () {
      getTagGroupsFromStringsFunc(tagGroupStrings);
      tagGroupParsers.forEach(function (tagGroupParser) {
        expect(tagGroupParser.parse).to.have.been.called;
      });
    });

    it("returns the tag groups", function () {
      expect(getTagGroupsFromStringsFunc(tagGroupStrings)).to.eql(tagGroups);
    });
  });
});
