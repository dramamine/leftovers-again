/**
 * Utility functions.
 *
 */
const toId = function(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
};

export default toId;
