const SideConditions = require('@la/constants/sideConditions');
const Side = require('@la/model/side');
const Log = require('@la/log');

let side;
describe('Side', () => {
  beforeEach(() => {
    side = new Side();
  });
  it('should handle a true-false effect', () => {
    side.digest(SideConditions.LIGHTSCREEN);
    expect(side.data()[SideConditions.LIGHTSCREEN]).toBeTruthy();
  });
  it('should handle a stacked move', () => {
    // this move stacks
    side.digest(SideConditions.SPIKES);
    side.digest(SideConditions.SPIKES);
    expect(side.data()[SideConditions.SPIKES]).toBe(2);

    // limit is 3
    side.digest(SideConditions.SPIKES);
    side.digest(SideConditions.SPIKES);
    expect(side.data()[SideConditions.SPIKES]).toBe(3);
  });
  it('should process text', () => {
    side.digest('Move: Light Screen');
    expect(side.data()[SideConditions.LIGHTSCREEN]).toBeTruthy();
  });
  it('shouldn\'t worry about capitalization', () => {
    side.digest('MoVE: LiGHt scREEn');
    expect(side.data()[SideConditions.LIGHTSCREEN]).toBeTruthy();
  });
  it('should barf on a non-existent move', () => {
    spyOn(Log, 'warn');
    side.digest('Candygoats');
    expect(side.data()).toEqual({});
    expect(Log.warn).toHaveBeenCalled();
  });
  it('should remove', () => {
    side.digest(SideConditions.TAILWIND);
    expect(side.data()).not.toEqual({});
    side.remove(SideConditions.TAILWIND);
    expect(side.data()).toEqual({});
  });
});
