/**
 * Clearing inputs is all sorts of difficult.
 * Most can be cleared with a call to `clearValue`.
 *
 * Things like autocomplete elements expect to be focused,
 * so we trigger a `click` beforehand.
 *
 * Sometimes `clearValue` doesn't trigger an change event,
 * which means the react component state isn't updated
 * and the old value re-appears when next edit it.
 *
 * So we click afterwards to encourage an change event...
 *
 * SearchBox is more problematic, so we have `clearSlow` for that.
 */
exports.command = function clear (selector) {
  this
    .click(selector)
    .clearValue(selector)
    .click(selector)

  return this
}
