import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import { Close } from '../images/icons'

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

export default function (Component, opts) {
  const width = (opts && opts.width) || 675

  return React.createClass({
    propTypes: {
      open: PropTypes.bool.isRequired,
      onDismiss: PropTypes.func.isRequired
    },
    onDismiss (evt) {
      if (evt.currentTarget === evt.target) this.props.onDismiss(evt)
    },
    render () {
      const { open, onDismiss } = this.props
      if (!open) return null
      // Prevent scrolling of the page when modal is open. Modal has internal scrollable section
      const htmlStyle = open ? 'height:100%; overflow:hidden' : ''
      return (
        <div>
          <Helmet htmlAttributes={{ style: htmlStyle }} />
          <div className='fixed top-0 right-0 left-0 bottom-0 flex items-center justify-center z100' style={{background: 'rgba(35, 54, 75, 0.8)'}} onClick={this.onDismiss}>
            <div className='relative bg-white fit rounded' style={{width, maxWidth: '100%', maxHeight: '100vh', overflowY: 'auto'}}>
              <div className='absolute right-0 pointer px4 py3 gray20 hover-fill-trigger' style={{zIndex: 2}} onClick={onDismiss}>
                <Close />
              </div>
              <Component {...this.props} />
            </div>
          </div>
        </div>
      )
    }
  })
}
