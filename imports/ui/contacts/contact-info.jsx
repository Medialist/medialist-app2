import React, { PropTypes } from 'react'
import { CircleAvatar, SquareAvatar } from '../images/avatar'
import { EmailIcon } from '../images/icons'
import QuickAdd from '../lists/quick-add'
import InfoHeader from '../lists/info-header'
import AddToMasterList from '../lists/add-to-master-list'

const ContactInfo = React.createClass({
  propTypes: {
    contact: PropTypes.object,
    onEditClick: PropTypes.func
  },

  getInitialState () {
    return {
      showMore: false,
      addToMasterListOpen: false
    }
  },

  onShowMoreToggleClick (e) {
    e.preventDefault()
    this.setState({ showMore: !this.state.showMore })
  },

  onAddSectors () {
    this.setState({addToMasterListOpen: true})
  },

  dismissAddSectors () {
    this.setState({addToMasterListOpen: false})
  },

  onAddTags () {
    console.log(`TODO: add a tag to ${this.props.contact.name}'s contact`)
  },

  render () {
    if (!this.props.contact) return null
    const { onAddSectors, onAddTags, dismissAddSectors } = this
    const { addToMasterListOpen } = this.state
    const { name, avatar, emails, outlets, medialists } = this.props.contact
    const { showMore } = this.state
    return (
      <div>
        <div className='mb1'>
          <CircleAvatar className='ml2' size={70} avatar={avatar} name={name} />
          <div className='ml3 inline-block align-middle'>
            <span className='semibold block f-xl mb1'>{name}</span>
            <span className='block f-sm'>{(outlets && outlets.length) ? outlets[0].value : null}</span>
            <span className='block f-sm'>{outlets.map((o) => o.label).join(', ')}</span>
          </div>
        </div>
        <div className='clearfix p3 pt4 mt4 border-gray80 border-bottom'>
          <a href='#' className='f-xs blue right' onClick={this.props.onEditClick}>Edit Contact</a>
          <h1 className='m0 f-md normal gray20 left'>Info</h1>
        </div>
        <div className='clearfix p3'>
          <ul className='list-reset'>
            <ContactEmailItem emails={emails} />
          </ul>
          <a href='#' className='f-sm blue my3' onClick={this.onShowMoreToggleClick}>Show {showMore ? 'Less' : 'More'}</a>
        </div>
        {medialists.length > 0 &&
          <section>
            <InfoHeader name='Campaigns' />
            <div className='px2 py3'>
              {medialists.map((campaign) => {
                return <SquareAvatar name={campaign} size={38} style={{marginRight: '2px', marginBottom: '2px'}} />
              })}
            </div>
          </section>
        }
        <AddToMasterList open={addToMasterListOpen} onDismiss={dismissAddSectors} />
        <QuickAdd
          sectors={['Energy', 'Healthcare', 'Robotics']}
          tags={[
            {
              _id: 'mongoidfornhs',
              name: 'NHS',
              count: 23
            },
            {
              _id: 'mongoidfortechnology',
              name: 'Technology',
              count: 78
            }
          ]}
          onAddTags={onAddTags}
          onAddSectors={onAddSectors} />
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
