import Fitness from 'bots/randombattle/fitness/fitness';
const fitness = new Fitness();

describe('Fitness', () => {
  describe('_getHitsEndured', () => {
    let attacker;
    let defender;
    beforeEach( () => {
      attacker = {
        stats: {
          speed: 150
        },
        statuses: '',
        volatileStatuses: '',
      };
      defender = {
        calculatedCurHP: 100,
        calculatedMaxHP: 100,
        calculatedStats: {
          speed: 100
        },
        statuses: '',
        volatileStatuses: '',
      };
    });
    it('should calculate no hits for a fast OHKO move', () => {
      spyOn(fitness, '_getMaxDmg').and.returnValue(100);
      spyOn(fitness, '_chanceOfFirst').and.returnValue(1);
      expect(fitness._getHitsEndured(attacker, defender)).toEqual(0);
    });
    it('should calculate 0-1 for a same-speed OHKO move', () => {
      spyOn(fitness, '_getMaxDmg').and.returnValue(100);
      spyOn(fitness, '_chanceOfFirst').and.returnValue(0.5);
      expect(fitness._getHitsEndured(attacker, defender)).toEqual(0.5);
    });
    it('should calculate 0-1 for a slow OHKO move', () => {
      spyOn(fitness, '_getMaxDmg').and.returnValue(100);
      spyOn(fitness, '_chanceOfFirst').and.returnValue(0.3);
      expect(fitness._getHitsEndured(attacker, defender)).toEqual(0.7);
    });
    it('should calculate 1-2 for a same-speed 2HKO move', () => {
      spyOn(fitness, '_getMaxDmg').and.returnValue(50);
      spyOn(fitness, '_chanceOfFirst').and.returnValue(0.5);
      expect(fitness._getHitsEndured(attacker, defender)).toEqual(1.5);
    });
    it('should add 2.1 turns for a frozen attacker', () => {
      spyOn(fitness, '_getMaxDmg').and.returnValue(50);
      spyOn(fitness, '_chanceOfFirst').and.returnValue(0);
      attacker.statuses = 'frz';
      expect(fitness._getHitsEndured(attacker, defender)).toEqual(4.1);
    });
    it('should add 2 turns for a sleepy attacker', () => {
      spyOn(fitness, '_getMaxDmg').and.returnValue(50);
      spyOn(fitness, '_chanceOfFirst').and.returnValue(0);
      attacker.statuses = 'slp';
      expect(fitness._getHitsEndured(attacker, defender)).toEqual(4);
    });
    it('should add 25% of turns for a paralyzed attacker', () => {
      spyOn(fitness, '_getMaxDmg').and.returnValue(50);
      spyOn(fitness, '_chanceOfFirst').and.returnValue(0);
      attacker.statuses = 'par';
      expect(fitness._getHitsEndured(attacker, defender)).toEqual(2.5);
    });
    it('should handle regular poison, 1/8 dmg per turn', () => {
      spyOn(fitness, '_getMaxDmg').and.returnValue(12.5);
      spyOn(fitness, '_chanceOfFirst').and.returnValue(0);
      defender.statuses = 'psn';
      expect(fitness._getHitsEndured(attacker, defender)).toEqual(4);
    });
    it('should handle a burn, 1/8 dmg per turn', () => {
      spyOn(fitness, '_getMaxDmg').and.returnValue(12.5);
      spyOn(fitness, '_chanceOfFirst').and.returnValue(0);
      defender.statuses = 'brn';
      expect(fitness._getHitsEndured(attacker, defender)).toEqual(4);
    });
    it('should handle bad poison, kills in 6 turns', () => {
      spyOn(fitness, '_getMaxDmg').and.returnValue(0);
      spyOn(fitness, '_chanceOfFirst').and.returnValue(0);
      defender.statuses = 'tox';
      expect(fitness._getHitsEndured(attacker, defender)).toEqual(6);
    });
  });
});
