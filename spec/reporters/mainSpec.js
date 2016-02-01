const exampleState = {"self":{"active":{"condition":"302/302","conditions":['par poi'],"species":"Noctowl","level":83,"gender":"M","hp":302,"maxhp":302,"hppct":100,"active":true,"types":["Normal","Flying"],"baseStats":{"hp":100,"atk":50,"def":50,"spa":76,"spd":96,"spe":70},"abilities":{"0":"Insomnia","1":"Keen Eye","H":"Tinted Lens"},"baseAbility":"tintedlens","stats":{"atk":131,"def":131,"spa":174,"spd":207,"spe":164},"position":"p1a","owner":"p1","item":"leftovers"},"reserve":[{"condition":"302/302","conditions":['poi fro'],"species":"Noctowl","level":83,"gender":"M","hp":302,"maxhp":302,"hppct":100,"active":true,"types":["Normal","Flying"],"baseStats":{"hp":100,"atk":50,"def":50,"spa":76,"spd":96,"spe":70},"abilities":{"0":"Insomnia","1":"Keen Eye","H":"Tinted Lens"},"baseAbility":"tintedlens","stats":{"atk":131,"def":131,"spa":174,"spd":207,"spe":164},"position":"p1a","owner":"p1","item":"leftovers"},{"condition":"311/311","conditions":[],"species":"Cresselia","level":77,"gender":"F","hp":311,"maxhp":311,"hppct":100,"types":["Psychic"],"baseStats":{"hp":120,"atk":70,"def":120,"spa":75,"spd":130,"spe":85},"abilities":{"0":"Levitate"},"baseAbility":"levitate","stats":{"atk":152,"def":229,"spa":160,"spd":245,"spe":175},"owner":"p1","item":"leftovers"},{"dead":true,"condition":"0 fnt","conditions":[],"species":"Tangrowth","level":79,"gender":"F","maxhp":288,"types":["Grass"],"baseStats":{"hp":100,"atk":100,"def":125,"spa":110,"spd":50,"spe":50},"abilities":{"0":"Chlorophyll","1":"Leaf Guard","H":"Regenerator"},"baseAbility":"regenerator","stats":{"atk":203,"def":243,"spa":219,"spd":125,"spe":124},"owner":"p1","item":"lifeorb"},{"condition":"285/285","conditions":[],"species":"Articuno","level":83,"gender":"M","hp":285,"maxhp":285,"hppct":100,"types":["Ice","Flying"],"baseStats":{"hp":90,"atk":85,"def":100,"spa":95,"spd":125,"spe":85},"abilities":{"0":"Pressure","H":"Snow Cloak"},"baseAbility":"pressure","stats":{"atk":189,"def":214,"spa":205,"spd":255,"spe":189},"owner":"p1","item":"leftovers"},{"dead":true,"condition":"0 fnt","conditions":[],"species":"Camerupt","level":79,"gender":"M","maxhp":240,"types":["Fire","Ground"],"baseStats":{"hp":70,"atk":100,"def":70,"spa":105,"spd":75,"spe":40},"abilities":{"0":"Magma Armor","1":"Solid Rock","H":"Anger Point"},"baseAbility":"solidrock","stats":{"atk":204,"def":156,"spa":211,"spd":164,"spe":109},"owner":"p1","item":"cameruptite"},{"condition":"281/281","conditions":[],"species":"Conkeldurr","level":75,"gender":"F","hp":281,"maxhp":281,"hppct":100,"types":["Fighting"],"baseStats":{"hp":105,"atk":140,"def":95,"spa":55,"spd":65,"spe":45},"abilities":{"0":"Guts","1":"Sheer Force","H":"Iron Fist"},"baseAbility":"sheerforce","stats":{"atk":254,"def":186,"spa":126,"spd":141,"spe":111},"owner":"p1","item":"lifeorb"}]},"opponent":{"active":{"condition":"85/100","conditions":[],"species":"Arcanine","level":77,"gender":"M","hp":85,"maxhp":100,"hppct":85,"types":["Fire"],"baseStats":{"hp":90,"atk":110,"def":80,"spa":100,"spd":80,"spe":95},"abilities":{"0":"Intimidate","1":"Flash Fire","H":"Justified"},"position":"p2a","owner":"p2","item":"lifeorb"},"reserve":[{"dead":true,"condition":"0 fnt","conditions":[],"species":"Registeel","level":79,"gender":"M","maxhp":100,"types":["Steel"],"baseStats":{"hp":80,"atk":75,"def":150,"spa":75,"spd":150,"spe":50},"abilities":{"0":"Clear Body","H":"Light Metal"},"owner":"p2"},{"dead":true,"condition":"0 fnt","conditions":[],"species":"Abomasnow","level":77,"gender":"F","maxhp":100,"types":["Grass","Ice"],"baseStats":{"hp":90,"atk":92,"def":75,"spa":92,"spd":85,"spe":60},"abilities":{"0":"Snow Warning","H":"Soundproof"},"owner":"p2"},{"dead":true,"condition":"0 fnt","conditions":[],"species":"Weezing","level":81,"gender":"M","maxhp":100,"types":["Poison"],"baseStats":{"hp":65,"atk":90,"def":120,"spa":85,"spd":70,"spe":60},"abilities":{"0":"Levitate"},"owner":"p2"},{"condition":"85/100","conditions":[],"species":"Arcanine","level":77,"gender":"M","hp":85,"maxhp":100,"hppct":85,"types":["Fire"],"baseStats":{"hp":90,"atk":110,"def":80,"spa":100,"spd":80,"spe":95},"abilities":{"0":"Intimidate","1":"Flash Fire","H":"Justified"},"position":"p2a","owner":"p2","item":"lifeorb"}]},"rqid":25};

import Reporter from 'reporters/main';

fdescribe('main reporter', () => {
  it('should report as I expect', () => {
    const res = Reporter.report(exampleState);
    // console.log(res);
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
});
