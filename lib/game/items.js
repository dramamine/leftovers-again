'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _formats = require('../data/formats');

var _formats2 = _interopRequireDefault(_formats);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Items = function () {
  function Items() {
    _classCallCheck(this, Items);
  }

  _createClass(Items, null, [{
    key: 'hasRequiredItem',
    value: function hasRequiredItem(id) {
      var formatData = _formats2.default[id];
      if (formatData && formatData.requiredItem) return formatData.requiredItem;
      return null;
    }
  }, {
    key: 'possibleItems',
    value: function possibleItems() {
      return ['Air Balloon', 'Assault Vest', 'Black Sludge', 'Chesto Berry', 'Choice Band', 'Choice Scarf', 'Choice Specs', 'Custap Berry', 'Damp Rock', 'DeepSeaTooth', 'Eviolite', 'Expert Belt', 'Flame Orb', 'Flying Gem', 'Focus Sash', 'Heat Rock', 'Leftovers', 'Life Orb', 'Light Ball', 'Light Clay', 'Lum Berry', 'Lustrous Orb', 'Normal Gem', 'Petaya Berry', 'Power Herb', 'Red Card', 'Rocky Helmet', 'Scope Lens', 'Sharp Beak', 'Sitrus Berry', 'Sitrus Berry', 'Smooth Rock', 'Stick', 'Thick Club', 'Toxic Orb', 'Weakness Policy', 'White Herb'];
    }
  }]);

  return Items;
}();

exports.default = Items;