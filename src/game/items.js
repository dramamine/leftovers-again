const Formats = require('../data/formats.json');

class Items {
  static hasRequiredItem(id) {
    const formatData = Formats[id];
    if (formatData && formatData.requiredItem) return formatData.requiredItem;
    return null;
  }

  static possibleItems() {
    return ['Air Balloon',
      'Assault Vest',
      'Black Sludge',
      'Chesto Berry',
      'Choice Band',
      'Choice Scarf',
      'Choice Specs',
      'Custap Berry',
      'Damp Rock',
      'DeepSeaTooth',
      'Eviolite',
      'Expert Belt',
      'Flame Orb',
      'Flying Gem',
      'Focus Sash',
      'Heat Rock',
      'Leftovers',
      'Life Orb',
      'Light Ball',
      'Light Clay',
      'Lum Berry',
      'Lustrous Orb',
      'Normal Gem',
      'Petaya Berry',
      'Power Herb',
      'Red Card',
      'Rocky Helmet',
      'Scope Lens',
      'Sharp Beak',
      'Sitrus Berry',
      'Sitrus Berry',
      'Smooth Rock',
      'Stick',
      'Thick Club',
      'Toxic Orb',
      'Weakness Policy',
      'White Herb'
    ];
  }
}

module.exports = Items;
