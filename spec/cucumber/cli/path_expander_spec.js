

describe("Cucumber.Cli.ArgumentParser.PathExpander", function () {
  var PathExpander = requireLib('cucumber').Cli.PathExpander;

  describe("expandPathsWithExtensions", function () {
    var unexpandedPaths, extensions, expandedPaths;

    beforeEach(function () {
      extensions      = createSpy("extensions");
      unexpandedPaths = [createSpy("unexpanded path 1"), createSpy("unexpanded path 2")];
      expandedPaths   = [createSpy("expanded path 1-1"), createSpy("expanded path 1-2"), createSpy("expanded path 2-1")];
      sinon.stub(PathExpander, 'expandPathWithExtensions').and.returnValues([expandedPaths[0], expandedPaths[1]], [expandedPaths[1], expandedPaths[2]]);
    });

    it("expands each path", function () {
      PathExpander.expandPathsWithExtensions(unexpandedPaths, extensions);
      unexpandedPaths.forEach(function (unexpandedPath) {
        expect(PathExpander.expandPathWithExtensions).to.have.been.calledWith(unexpandedPath, extensions);
      });
    });

    it("returns the expanded paths without duplicates", function () {
      expect(PathExpander.expandPathsWithExtensions(unexpandedPaths)).to.eql(expandedPaths);
    });
  });

  describe("expandPathWithExtensions()", function () {
    var fs   = require('fs');
    var path, extensions, stats, realPath, pathsFromExpandedDirectory;

    beforeEach(function () {
      path       = "relative/path";
      extensions = createSpy("extensions");
      stats      = createStubbedObject({isDirectory: null});
      sinon.stub(fs, 'statSync').returns(stats);
      realPath   = "/real/path";
      sinon.stub(fs, 'realpathSync').returns(realPath);
      pathsFromExpandedDirectory = createSpy("paths from expanded directory");
      sinon.stub(PathExpander, 'expandDirectoryWithExtensions').returns(pathsFromExpandedDirectory);
    });

    it("synchronously gets the absolute representation of the path after", function () {
      PathExpander.expandPathWithExtensions(path, extensions);
      expect(fs.realpathSync).to.have.been.calledWith('relative/path');
    });

    it("synchronously stats the path", function () {
      PathExpander.expandPathWithExtensions(path, extensions);
      expect(fs.statSync).to.have.been.calledWith(realPath);
    });

    it("checks whether the path points to a directory or not", function () {
      PathExpander.expandPathWithExtensions(path, extensions);
      expect(stats.isDirectory).to.have.been.called;
    });

    describe("when the path points to a directory", function () {
      beforeEach(function () {
        stats.isDirectory.returns(true);
      });

      it("expands the directory", function () {
        PathExpander.expandPathWithExtensions(path, extensions);
        expect(PathExpander.expandDirectoryWithExtensions).to.have.been.calledWith(realPath, extensions);
      });

      it("returns the paths expanded from the directory", function () {
        expect(PathExpander.expandPathWithExtensions(path, extensions)).to.equal(pathsFromExpandedDirectory);
      });
    });

    describe("when the path does not point to a directory", function () {
      beforeEach(function () {
        stats.isDirectory.returns(false);
      });

      it("returns an array with the absolute path as its only item", function () {
        expect(PathExpander.expandPathWithExtensions(path, extensions)).to.eql([realPath]);
      });
    });
  });

  describe("expandDirectoryWithExtensions()", function () {
    var glob = require('glob');
    var directory, extensions, innerPaths;

    beforeEach(function () {
      directory  = "path/to/directory";
      extensions = ['js'];
      innerPaths = [createSpy("inner path 1"), createSpy("inner path 2"), createSpy("inner path 3")];
      sinon.stub(glob, 'sync').returns(innerPaths);
    });

    it("returns the glob result", function () {
      var paths = PathExpander.expandDirectoryWithExtensions(directory, extensions);
      expect(paths).to.eql(innerPaths);
    });

    describe('one extension', function() {
      it("calls glob with the proper pattern", function () {
        PathExpander.expandDirectoryWithExtensions(directory, extensions);
        expect(glob.sync).to.have.been.calledWith("path/to/directory/**/*.js");
      });
    });

    describe('multiple extension', function() {
      beforeEach(function () {
        extensions = ['js', 'coffee'];
      });

      it("calls glob with the proper pattern", function () {
        PathExpander.expandDirectoryWithExtensions(directory, extensions);
        expect(glob.sync).to.have.been.calledWith("path/to/directory/**/*.{js,coffee}");
      });
    });
  });
});
