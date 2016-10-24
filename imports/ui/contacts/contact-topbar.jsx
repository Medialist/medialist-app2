import React, { PropTypes } from 'react'
import { browserHistory } from 'react-router'

const ContactTopbar = React.createClass({
  propTyeps: {
    contact: PropTypes.object
  },

  onBackClick (e) {
    e.preventDefault()
    browserHistory.go(-1)
  },

  render () {
    const { contact } = this.props
    if (!contact) return null

    return (
      <nav className='block bg-white mb4 p4'>
        <div className='flex px1'>
          <div className='flex-auto'>
            <a href='#' onClick={this.onBackClick}>◀ Back</a>
          </div>
          <div className='flex-auto right-align'>
            <button type='button' onClick={() => console.log('TODO: Add to campaign')}>
              Add <FirstName contact={contact} /> to Campaign
            </button>
          </div>
        </div>
      </nav>
    )
  }
})

const FirstName = ({ contact }) => (
  <span>{contact ? contact.name.split(' ')[0] : 'Unknown'}</span>
)

export default ContactTopbar
