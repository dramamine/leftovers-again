const Reporter = require('@la/reporters/matchstatus');

const exampleState = {"self":{"active":{"condition":"302/302","hppct":100,"lastMove":"Sandstorm","boosts":{"spd":-1},"statuses":["par", "poi"],"species":"Noctowl"},"reserve":[{},{},{"dead":true},{},{"dead":true},{}]},"opponent":{"active":{"condition":"85/100","hppct":85,"statuses":[],"boosts":{"atk":1},"species":"Arcanine","lastMove":"Roost"},"reserve":[{"dead":true},{"dead":true},{"dead":true},{}]}}; // eslint-disable-line

describe('matchstatus reporter', () => {
  it('should report as I expect', () => {
    spyOn(console, 'log');
    Reporter.report(exampleState);
    expect(console.log).toHaveBeenCalled();
  });
  describe('pad left', () => {
    it('should pad left', () => {
      expect(Reporter.padLeft('thing', 8)).toEqual('   thing');
    });
    it('should pad right', () => {
      expect(Reporter.padRight('thing', 8)).toEqual('thing   ');
    });
  });
  describe('status string', () => {
    it('should handle two statuses by simply joining', () => {
      expect(Reporter.statusString(['par', 'poi'])).toEqual('[par poi]');
    });
    it('should handle three statuses by using two characters', () => {
      expect(Reporter.statusString(['par', 'poi', 'brn'])).toEqual('[pa po br]');
    });
    it('should handle four statuses by truncating', () => {
      expect(Reporter.statusString(['par', 'poi', 'brn', 'fro'])).toEqual('[pa po br]');
    });
  });
  describe('boost string', () => {
    it('should handle good & bad statuses', () => {
      expect(Reporter.boostString({ atk: 2, def: -1 })).toEqual('atk++ def-');
    });
  });
});

