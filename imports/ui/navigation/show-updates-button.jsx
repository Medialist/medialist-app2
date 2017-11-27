import React from 'react'

// z-index 50 puts this button below modals, but provided as a prop so can be
// altered if components within modals want to use it.
export default ({ total, zIndex = 50, onClick }) => {
  if (!total) return null

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
