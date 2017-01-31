import React, { PropTypes } from 'react'
import { Close } from '../images/icons'

const SnackbarItem = ({show, onDismiss, children, style}) => (
  <div className='shadow-1 table bg-gray10' style={{height: 52, transition: 'transform 300ms ease-in', ...style}}>
    <div className='table-cell align-middle white pl4'>
      {children}
    </div>
    <div className='table-cell align-middle px4'>
      <Close className='gray20' onClick={onDismiss} />
    </div>
  </div>
)

// Place me high up in the tree. I make a space for snackbars to play.
const Snackbar = React.createClass({
  propTypes: {
    children: PropTypes.node
  },
  getInitialState () {
    return {
      messages: ['hello']
    }
  },
  childContextTypes: {
    snackbar: PropTypes.object.isRequired
  },
  show (message) {
    this.setState((s) => {
      // message is possibly an array o nodes that should be treated as 1 item.
      return s.messages.slice().push(message)
    })
  },
  getChildContext () {
    return {
      snackbar: {
        show: this.show.bind(this)
      }
    }
  },
  render () {
    const { children } = this.props
    const { messages } = this.state
    return (
      <div onClick={() => this.show('Hello')}>
        {children}
        <div className='snackbars' style={{
          position: 'fixed',
          bottom: 0,
          right: 20
        }}>
          {messages.map((msg, index) => (
            <div className='mb4'>
              <SnackbarItem>
                {msg}
              </SnackbarItem>
            </div>
          ))}
        </div>
      </div>
    )
  }
})

export default Snackbar
