import Listener from '../src/listener';


describe('listener', () => {
  it('should load listener', () => {
    console.log('testing...');
    expect(Listener).toBeDefined();
  });

  it('should listen for and receive a message', () => {
    const spy = jasmine.createSpy('spy');
    Listener.subscribe('hello', spy);
    Listener.relay('hello','world');
    expect(spy).toHaveBeenCalledWith('world');
  });

  it('should unsubscribe from messages', () => {
    const spy = jasmine.createSpy('spy');
    Listener.subscribe('hello', spy);
    Listener.unsubscribe('hello', spy);
    const result = Listener.relay('hello','world');
    expect(spy).not.toHaveBeenCalled();
  });

  it('should return false when unsubscribing from something not subscribed', () => {
    let result = Listener.unsubscribe('fake', () => {});
    expect(result).toBe(false);

    result = Listener.subscribe('fake', () => {});
    result = Listener.unsubscribe('fake', () => {});
    expect(result).toBe(false);
  });

});
