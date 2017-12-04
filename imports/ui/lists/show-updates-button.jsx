import React from 'react'

// z-index 50 puts this button below modals, but provided as a prop so can be
// altered if components within modals want to use it.
export default ({ data, diff, zIndex = 50, onClick }) => {
  if (!diff.total.changes) return null

  let total = diff.total.changes

  // Same amount added as removed, chances are this is a paginated list -
  // new items added, and pushed out old items...or an item removed and other
  // items take their place
  if (diff.total.added > 0 && diff.total.added === diff.total.removed) {
    total = diff.total.added
  }

  return (
    <button
      type='button'
      className='btn white bg-blue fixed bottom-0 mb5'
      style={{ left: '50%', transform: 'translate(-50%, 0)', zIndex }}
      onClick={onClick}>
      Show {total} new update{total > 1 ? 's' : ''}
    </button>
  )
}
