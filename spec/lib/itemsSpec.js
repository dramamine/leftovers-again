import Items from 'leftovers-again/game/items';

describe('Items', () => {
  describe('hasRequiredItem', () => {
    it('should read the data properly', () => {
      expect(Items.hasRequiredItem('charizardmegax')).toBe('Charizardite X');
    });
  });
});
