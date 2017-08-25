const Typechart = require('@la/game/typechart');
const Log = require('@la/log');

describe('typechart', () => {
  describe('compare', () => {
    it('should look up stringy targets', () => {
      expect(Typechart.compare('Normal', 'Normal')).toEqual(1);
      expect(Typechart.compare('Normal', 'Bug')).toEqual(1);
      expect(Typechart.compare('Ice', 'Fire')).toEqual(0.5);
      expect(Typechart.compare('Ice', 'Flying')).toEqual(2);
    });
    it('should look up array-y targets', () => {
      expect(Typechart.compare('Normal', ['Normal', 'Bug'])).toEqual(1);
      expect(Typechart.compare('Normal', ['Normal', 'Rock'])).toEqual(0.5);
      // ghost is immune
      expect(Typechart.compare('Normal', ['Ghost', 'Steel'])).toEqual(0);
      // doubly resistant
      expect(Typechart.compare('Normal', ['Steel', 'Rock'])).toEqual(0.25);
      // doubly effective
      expect(Typechart.compare('Grass', ['Ground', 'Rock'])).toEqual(4);
    });
    it('should throw an error for incorrect terms', () => {
      spyOn(Log, 'error');
      Typechart.compare('Fruit', 'Vegetable');
      expect(Log.error).toHaveBeenCalled();
    });
    it('should throw an error for one incorrect term', () => {
      spyOn(Log, 'error');
      Typechart.compare('Normal', 'Vegetable');
      expect(Log.error).toHaveBeenCalled();
    });
  });
});
