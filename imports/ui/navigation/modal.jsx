import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'

/*
Modal as "Higher Order Component"...
A function that takes a Component and returns a Component.

Usage:
```jsx
  const MyForm = React.createComponent({...})
  <MyForm formThing={foo} />

  const MyFormModal = Modal(MyForm)
  <MyFormModal open={isOpen?} onDismiss={toggleMe} formThing={foo} />
```

The component will be passed an `onDismiss` function to call when closing the
modal, and a `open` prop, though this will always be true, as the child is only
rendered when the modal is open.
*/

export default function (Component) {
  return React.createClass({
    propTypes: {
      open: PropTypes.bool.isRequired,
      onDismiss: PropTypes.func.isRequired
    },
    render () {
      const { open, onDismiss } = this.props
      if (!open) return null
      // Prevent scrolling of the page when modal is open. Modal has internal scrollable section
      const htmlStyle = open ? 'height:100%; overflow:hidden' : ''
      return (
        <div>
          <Helmet htmlAttributes={{ style: htmlStyle }} />
          <div className='fixed top-0 right-0 left-0 bottom-0' style={{background: 'rgba(35, 54, 75, 0.8)'}} onClick={onDismiss} />
          <div className='absolute top-0 right-0 left-0 bg-white fit mx-auto z100' style={{width: 675}}>
            <div className='inline-block right pointer f-xxl mx2 gray60 hover-blue' onClick={onDismiss}>&times;</div>
            <Component {...this.props} />
          </div>
        </div>
      )
    }
  })
}