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
      <nav className='block bg-white mb4 flex items-center'>
        <div className='flex-auto'>
          <a className='inline-block p4' href='#' onClick={this.onBackClick}>◀ Back</a>
        </div>
        <div className='flex-none border-left border-gray80 px4 py3'>
          <button type='button' className='btn white bg-blue mx2' onClick={() => console.log('TODO: Add to campaign')}>
            Add <FirstName contact={contact} /> to Campaign
          </button>
        </div>
      </nav>
    )
  }
})

const FirstName = ({ contact }) => (
  <span>{contact ? contact.name.split(' ')[0] : 'Unknown'}</span>
)

export default ContactTopbar
