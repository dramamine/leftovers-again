const KO = require('@la/game/kochance');

describe('KO', () => {
  describe('predictKO', () => {
    it('should predictably handle False Swipe', () => {
      const kochance = KO.predictKO([40], {
        hp: 200,
        maxhp: 200,
      });
      expect(kochance.turns).toBe(5);
      expect(kochance.chance).toBe(100);
    });
    it('should calculate chance correctly', () => {
      const kochance = KO.predictKO([0, 100], {
        hp: 200,
        maxhp: 200,
      });
      expect(kochance.turns).toBe(2);
      expect(kochance.chance).toBe(25);
    });
  });
  // describe('_simpleGetKOChance', () => {
  //   it('should return 0 when KOs are impossible', () => {
  //     let result = KO._simpleGetKOChance([1], 100, 0, 10, 100, 0);
  //     expect(result).toBe(0);
  //     result = KO._simpleGetKOChance([1,2,3,4,5,6,7,8,9], 100, 0, 10, 100, 0);
  //     expect(result).toBe(0);
  //     result = KO._simpleGetKOChance([1,2,3,4,5], 100, 5, 9, 100, 0);
  //     expect(result).toBe(0);
  //   });
  //   it('should return 1 when KOs are guaranteed', () => {
  //     let result = KO._simpleGetKOChance([100], 100, 0, 1, 100, 0);
  //     expect(result).toBe(1);
  //     result = KO._simpleGetKOChance([100,105,200], 100, 0, 1, 100, 0);
  //     expect(result).toBe(1);
  //     result = KO._simpleGetKOChance([100,105,200], 500, 0, 5, 100, 0);
  //     expect(result).toBe(1);
  //     result = KO._simpleGetKOChance([0,1], 100, 20, 5, 100, 0);
  //     expect(result).toBe(1);
  //   });
  //   it('should handle approximation', () => {
  //     let result = KO._simpleGetKOChance([0,100], 100, 0, 1, 100, 0);
  //     expect(result).toBe(0.5);
  //     result = KO._simpleGetKOChance([100,150,200,250], 200, 0, 1, 100, 0);
  //     expect(result).toBe(0.5);

  //     result = KO._simpleGetKOChance([0,100,200,300], 100, 0, 4, 100, 0);
  //     expect(result).toBeCloseTo(KO._normalize(1 / 12, 0.001));
  //     // in reality: this would happen 1 - (1/4)^ times
  //     // 0.00390625
  //     expect(result).toBeCloseTo(.00390625, 4);

  //     result = KO._simpleGetKOChance([1,2,3,4,5], 10, 0, 4, 100, 0);
  //     //


  //   });
  // describe('_normalize', () => {
  //   it('should work', () => {
  //     expect(KO._normalize(0)).toBeCloseTo(0.05, 2);
  //     expect(KO._normalize(1)).toBeCloseTo(0.95, 2);
  //     expect(KO._normalize(0.5)).toBeCloseTo(0.5, 2);
  //   });
  // });
  // });
});
