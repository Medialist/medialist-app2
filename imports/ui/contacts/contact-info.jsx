import React, { PropTypes } from 'react'
import { CircleAvatar } from '../images/avatar'
import { EmailIcon } from '../images/icons'

const ContactInfo = React.createClass({
  propTypes: {
    contact: PropTypes.object,
    onEditClick: PropTypes.func
  },

  getInitialState () {
    return { showMore: false }
  },

  onShowMoreToggleClick (e) {
    e.preventDefault()
    this.setState({ showMore: !this.state.showMore })
  },

  render () {
    if (!this.props.contact) return null

    const { name, avatar, emails, jobTitles, primaryOutlets } = this.props.contact
    const { showMore } = this.state

    return (
      <div>
        <div className='mb1'>
          <CircleAvatar avatar={avatar} name={name} />
          <div className='ml3 inline-block align-middle'>
            <span className='semibold block f-xl'>{name}</span>
            <span className='block f-sm'>{jobTitles}</span>
            <span className='block f-sm'>{primaryOutlets}</span>
          </div>
        </div>
        <div className='clearfix p3 border-gray80 border-bottom'>
          <a href='#' className='f-xs blue right' onClick={this.props.onEditClick}>Edit Contact</a>
          <h1 className='m0 f-md normal gray20 left'>Info</h1>
        </div>
        <ul className='list-reset'>
          <ContactEmailItem emails={emails} />
        </ul>
        <a href='#' className='f-sm blue my3' onClick={this.onShowMoreToggleClick}>Show {showMore ? 'Less' : 'More'}</a>
      </div>
    )
  }
})

const ContactEmailItem = ({ emails }) => {
  if (!emails || !emails.length) return null
  const email = emails[0].value

  return (
    <li>
      <a href={`mailto:${encodeURIComponent(email)}`} className='hover-blue'>
        <EmailIcon /> {email}
      </a>
    </li>
  )
}

export default ContactInfo
