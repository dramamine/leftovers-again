import SideEffects from 'constants/sideeffects';
import Side from 'model/side';
import Log from 'log';

let side;
fdescribe('Side', () => {
  beforeEach( () => {
    side = new Side();
  });
  it('should handle a true-false effect', () => {
    side.digest(SideEffects.LIGHT_SCREEN);
    expect(side.data()[SideEffects.LIGHT_SCREEN]).toBeTruthy();
  });
  it('should handle a stacked move', () => {
    // this move stacks
    side.digest(SideEffects.SPIKES);
    side.digest(SideEffects.SPIKES);
    expect(side.data()[SideEffects.SPIKES]).toBe(2);

    // limit is 3
    side.digest(SideEffects.SPIKES);
    side.digest(SideEffects.SPIKES);
    expect(side.data()[SideEffects.SPIKES]).toBe(3);
  });
  it('should process text', () => {
    side.digest('Move: Light Screen');
    expect(side.data()[SideEffects.LIGHT_SCREEN]).toBeTruthy();
  });
  it('should barf on a non-existent move', () => {
    spyOn(Log, 'warn');
    side.digest('Candygoats');
    expect(side.data()).toEqual({});
    expect(Log.warn).toHaveBeenCalled();
  });
  it('should remove', () => {
    side.digest(SideEffects.TAILWIND);
    expect(side.data()).not.toEqual({});
    side.remove(SideEffects.TAILWIND);
    expect(side.data()).toEqual({});
  });
});
