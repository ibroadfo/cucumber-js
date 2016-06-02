require('../support/spec_helper');

describe("Cucumber.Listener", function () {
  var Cucumber = requireLib('cucumber');
  var listener;

  beforeEach(function () {
    listener = Cucumber.Listener();
  });

  describe("hear()", function () {
    var event, callback;
    var eventHandler;

    beforeEach(function () {
      event    = createSpy("event");
      callback = createSpy("callback");
      sinon.stub(listener, 'hasHandlerForEvent');
      sinon.stub(listener, 'getHandlerForEvent');
    });

    it("checks whether there is a handler for the event", function () {
      listener.hear(event, callback);
      expect(listener.hasHandlerForEvent).to.have.been.calledWith(event);
    });

    describe("when there is a handler for that event", function () {
      beforeEach(function () {
        eventHandler = createSpy("Event handler (function)");
        listener.hasHandlerForEvent.returns(true);
        listener.getHandlerForEvent.returns(eventHandler);
      });

      it("gets the handler for that event", function () {
        listener.hear(event, callback);
        expect(listener.getHandlerForEvent).to.have.been.calledWith(event);
      });

      it("calls the handler with the event and the callback", function () {
        listener.hear(event, callback);
        expect(eventHandler).to.have.been.calledWith(event, callback);
      });

      it("does not callback", function () {
        listener.hear(event, callback);
        expect(callback).not.to.have.been.called;
      });
    });

    describe("when there are no handlers for that event", function () {
      beforeEach(function () {
        listener.hasHandlerForEvent.returns(false);
      });

      it("calls back", function () {
        listener.hear(event, callback);
        expect(callback).to.have.been.called;
      });

      it("does not get the handler for the event", function () {
        listener.hear(event, callback);
        expect(listener.getHandlerForEvent).not.to.have.been.called;
      });
    });
  });

  describe("hasHandlerForEvent", function () {
    var event, eventHandlerName, eventHandler;

    beforeEach(function () {
      event            = createSpy("Event");
      eventHandlerName = createSpy("event handler name");
      sinon.stub(listener, 'buildHandlerNameForEvent').returns(eventHandlerName);
    });

    it("builds the name of the handler for that event", function () {
      listener.hasHandlerForEvent(event);
      expect(listener.buildHandlerNameForEvent).to.have.been.calledWith(event);
    });

    describe("when the handler exists", function () {
      beforeEach(function () {
        eventHandler = createSpy("event handler");
        listener[eventHandlerName] = eventHandler;
      });

      it("returns true", function () {
        expect(listener.hasHandlerForEvent(event)).to.equal(true);
      });
    });

    describe("when the handler does not exist", function () {
      it("returns false", function () {
        expect(listener.hasHandlerForEvent(event)).to.equal(false);
      });
    });
  });

  describe("buildHandlerNameForEvent", function () {
    var event, eventName, buildHandlerName;

    beforeEach(function () {
      eventName = "SomeEventName";
      event     = createStubbedObject({getName: eventName});
      buildHandlerName = sinon.stub(listener, "buildHandlerName");
    });

    it("gets the name of the event", function () {
      listener.buildHandlerNameForEvent(event);
      expect(event.getName).to.have.been.called;
    });

    it("calls buildHandlerName", function () {
      listener.buildHandlerNameForEvent(event);
      expect(buildHandlerName).to.have.been.called;
    });
  });

  describe("getHandlerForEvent()", function () {
    var event;
    var eventHandlerName, eventHandler;

    beforeEach(function () {
      event            = createSpy("event");
      eventHandlerName = 'handleSomeEvent';
      eventHandler     = createSpy("event handler");
      sinon.stub(listener, 'buildHandlerNameForEvent').returns(eventHandlerName);
    });

    it("gets the name of the handler for the event", function () {
      listener.getHandlerForEvent(event);
      expect(listener.buildHandlerNameForEvent).to.have.been.calledWith(event);
    });

    describe("when an event handler exists for the event", function () {
      beforeEach(function () {
        listener[eventHandlerName] = eventHandler;
      });

      it("returns the event handler", function () {
        expect(listener.getHandlerForEvent(event)).to.equal(eventHandler);
      });
    });

    describe("when no event handlers exist for the event", function () {
      it("returns nothing", function () {
        expect(listener.getHandlerForEvent(event)).toBeUndefined();
      });
    });
  });

  describe("buildHandlerName", function () {
    it("returns the name of the event with prefix 'handle' and suffix 'Event'", function () {
      var eventName = "shortName";
      var expected = "handle" + eventName + "Event";

      expect(listener.buildHandlerName(eventName)).to.equal(expected);
    });
  });

  describe("setHandlerForEvent", function () {
    var shortName = "anEventName";
    var handler = function () {};
    var buildHandlerName;

    beforeEach(function () {
      buildHandlerName = sinon.stub(listener, "buildHandlerName").and.callThrough();
      listener.setHandlerForEvent(shortName, handler);
    });

    it("attaches the function as a property to itself", function () {
      var expectedKey = Cucumber.Listener.EVENT_HANDLER_NAME_PREFIX + shortName + Cucumber.Listener.EVENT_HANDLER_NAME_SUFFIX;
      expect(listener[expectedKey]).to.equal(handler);
    });

    it("calls buildHandlerName", function () {
      expect(buildHandlerName).to.have.been.called;
    });
  });
});
