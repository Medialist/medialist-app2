import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { Close } from '/imports/ui/images/icons'

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
export default (Component, opts = {}) => {
  const width = opts.width || 675
  const overflowY = opts.overflowY || 'auto'
  const dataId = opts['data-id']

  class Modal extends React.Component {
    onDismiss (event) {
      if (event) {
        event.preventDefault()
      }

      if (this.props.onDismiss) {
        this.props.onDismiss(event)
      }
    }

    onBackgroundClick (event) {
      // ignore bubbled events
      if (event.target === event.currentTarget) {
        this.onDismiss(event)
      }
    }

    render () {
      if (!this.props.open) {
        return null
      }

      // Prevent scrolling of the page when modal is open. Modal has internal scrollable section
      const style = 'height:100%; overflow:hidden'
      const componentProps = Object.assign({}, this.props, {
        onDismiss: this.onDismiss.bind(this)
      })

      return (
        <div>
          <Helmet htmlAttributes={{ style }} />
          <div className='fixed top-0 right-0 left-0 bottom-0 flex items-center justify-center z100' style={{background: 'rgba(35, 54, 75, 0.8)'}} onClick={(event) => this.onBackgroundClick(event)}>
            <div data-id={dataId} className='relative bg-white fit rounded' style={{width, maxWidth: '100%', maxHeight: '100vh', overflowY}}>
              <div className='absolute right-0 pointer px4 py3 gray20 hover-fill-trigger' style={{zIndex: 3}} onClick={(event) => this.onDismiss(event)}>
                <Close />
              </div>
              <Component {...componentProps} />
            </div>
          </div>
        </div>
      )
    }
  }

  Modal.propTypes = {
    open: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func
  }

  return Modal
}
