/**
 * Utility functions.
 *
 */
export default function toId(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
};
