const listener = require('@la/listener');

describe('listener', () => {
  it('should load listener', () => {
    expect(listener).toBeDefined();
  });

  it('should listen for and receive a message', () => {
    const spy = jasmine.createSpy('spy');
    listener.subscribe('hello', spy);
    listener.relay('hello', 'world');
    expect(spy).toHaveBeenCalledWith('world');


    listener.unsubscribe('hello', spy);
  });


  it('should not pass along messages of the wrong type', () => {
    const spy = jasmine.createSpy('spy');
    listener.subscribe('hello', spy);
    listener.relay('goodbye', 'world');
    expect(spy).not.toHaveBeenCalled();

    listener.unsubscribe('hello', spy);
  });


  it('should unsubscribe from messages', () => {
    const spy = jasmine.createSpy('spy');
    listener.subscribe('hello', spy);
    listener.unsubscribe('hello', spy);
    listener.relay('hello', 'world');
    expect(spy).not.toHaveBeenCalled();
  });

  it('should return false when unsubscribing from something not subscribed', () => {
    let result = listener.unsubscribe('fake', () => {});
    expect(result).toBe(false);

    result = listener.subscribe('fake', () => {});
    result = listener.unsubscribe('fake', () => {});
    expect(result).toBe(false);
  });
});
