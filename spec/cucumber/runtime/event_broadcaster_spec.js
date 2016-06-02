

describe("Cucumber.Runtime.EventBroadcaster", function () {
  var Cucumber = requireLib('cucumber');
  var eventBroadcaster, listeners;

  var createListener = function createListener(name) {
    var listener = createSpy(name);
    sinon.stubStub(listener, 'hear').and.callFake(function (event, cb) { cb(); });
    return listener;
  };

  beforeEach(function () {
    listeners = [createListener("First listener"), createListener("Second listener")];
    eventBroadcaster = Cucumber.Runtime.EventBroadcaster(listeners);
  });

  describe("broadcastAroundEvent()", function () {
    var preEvent, event, postEvent, userFunction;

    beforeEach(function (done) {
      preEvent = createSpy("pre event");
      postEvent = createSpy("post event");
      event = createStubbedObject({replicateAsPostEvent: postEvent, replicateAsPreEvent: preEvent});
      userFunction = createSpy('user function').and.callFake(function(cb) { cb(); });
      eventBroadcaster.broadcastAroundEvent(event, userFunction, done);
    });

    it("broadcasts the before event", function () {
      expect(listeners[0].hear).to.have.been.calledWith(preEvent, jasmine.any(Function));
      expect(listeners[1].hear).to.have.been.calledWith(preEvent, jasmine.any(Function));
    });

    it("calls the user function", function () {
      expect(userFunction).to.have.been.called;
    });

    it("broadcasts the after event", function () {
      expect(listeners[0].hear).to.have.been.calledWith(postEvent, jasmine.any(Function));
      expect(listeners[1].hear).to.have.been.calledWith(postEvent, jasmine.any(Function));
    });
  });

  describe("broadcastEvent()", function () {
    var event;

    beforeEach(function (done) {
      event = createSpy("event");
      eventBroadcaster.broadcastEvent(event, done);
    });

    it("broadcasts the event", function () {
      expect(listeners[0].hear).to.have.been.calledWith(event, jasmine.any(Function));
      expect(listeners[1].hear).to.have.been.calledWith(event, jasmine.any(Function));
    });
  });
});
