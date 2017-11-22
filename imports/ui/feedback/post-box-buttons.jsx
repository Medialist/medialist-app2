import React from 'react'

export default ({focused, disabled, onPost, isEdit, children}) => (
  <div style={{display: focused ? null : 'none'}}>
    <button
      onClick={onPost}
      className={`btn opacity-100 bg-gray80 right active-bg-blue ${disabled ? 'white' : 'active'}`}
      disabled={disabled}
      data-id='create-post-button'>
      {isEdit ? 'Save' : 'Post'}
    </button>
    {children}
  </div>
)
