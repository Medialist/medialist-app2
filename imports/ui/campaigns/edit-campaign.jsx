import React, { PropTypes } from 'react'
import { CameraIcon, BioIcon, WebsiteIcon, FilledCircle } from '../images/icons'
import Modal from '../navigation/modal'
import EditableAvatar from '../images/editable-avatar'
import ClientAutocomplete from './client-autocomplete'
import { create, update } from '/imports/api/medialists/methods'
import callAll from '/imports/lib/call-all'

const EditCampaign = React.createClass({
  propTypes: {
    open: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    clients: PropTypes.array.isRequired,
    campaign: PropTypes.object
  },
  getInitialState () {
    const { campaign } = this.props
    return {
      avatar: null,
      focus: null,
      name: campaign && campaign.name || '',
      purpose: campaign && campaign.purpose || '',
      clientName: campaign && campaign.client && campaign.client.name || '',
      links: campaign && campaign.links || ['']
    }
  },
  componentDidMount () {
    this.nameInput.focus()
  },
  onAvatarChange ({url}) {
    this.setState({avatar: url})
  },
  onAvatarError (err) {
    console.error('Failed to change avatar', err)
    console.log('TODO: toast error message')
  },
  onClientNameChange (clientName) {
    this.setState({clientName})
  },
  onClientSelect (name) {
    this.setState({clientName: name})
  },
  onChange (field) {
    return ({ target: { value } }) => {
      this.setState({ [field]: value })
    }
  },
  onChangeLink (ind) {
    return ({ target: { value } }) => {
      const newLinks = Object.assign(this.state.links, { [ind]: value })
      this.setState({ links: newLinks })
    }
  },
  checkLinkEmpty (ind) {
    return () => {
      if (!this.state.links[ind] && this.state.links.length > 1) {
        const newLinks = [...this.state.links]
        newLinks.splice(ind, 1)
        this.setState({ links: newLinks })
      }
    }
  },
  onSubmit (evt) {
    evt.preventDefault()
    const { campaign } = this.props
    const { avatar, name, purpose, clientName, links } = this.state
    const payload = { avatar, name, purpose, clientName, links }
    const done = (err) => {
      if (err) return console.error('Failed to edit campaign', err)
      this.props.onDismiss()
    }

    if (campaign) {
      update.call({ _id: campaign._id, ...payload }, done)
    } else {
      create.call(payload, done)
    }
  },
  onReset () {
    this.props.onDismiss()
  },
  addFocus (field) {
    return () => this.setState({ focus: field })
  },
  removeFocus () {
    this.setState({ focus: null })
  },
  focusState (field) {
    return this.state.focus === field ? 'blue' : 'gray60'
  },
  addLink () {
    if (this.state.links.some((l) => !l)) return
    this.setState({ links: [...this.state.links, ''] })
  },
  render () {
    if (!this.props.open) return null
    const { onChange, onChangeLink, onSubmit, onReset, onClientNameChange, onClientSelect, onAvatarChange, onAvatarError } = this
    const { campaign, clients } = this.props
    const { avatar, name, purpose, clientName, links } = this.state
    const inputStyle = { resize: 'none' }
    const iconStyle = { position: 'absolute', left: '-32px', top: '10px' }
    return (
      <form onSubmit={onSubmit} onReset={onReset}>
        <div className='px4 py6 center'>
          <EditableAvatar className='ml2' avatar={avatar} onChange={onAvatarChange} onError={onAvatarError}>
            <div className='bg-gray40 center rounded mx-auto' style={{height: '123px', width: '123px', lineHeight: '123px'}}>
              { avatar ? <img src={avatar} width='100%' height='100%' /> : <CameraIcon /> }
            </div>
          </EditableAvatar>
          <div>
            <input
              ref={(input) => { this.nameInput = input }}
              autoComplete='off'
              className='center gray10 input-inline mt4 f-xxxl semibold'
              type='text'
              name='name'
              value={name}
              placeholder='Campaign Name'
              size={name.length === 0 ? 15 : name.length + 2}
              onChange={onChange('name')}
               />
          </div>
        </div>
        <div className='bg-gray90 border-top border-gray80 py5 overflow-auto' style={{ maxHeight: '250px' }}>
          <div style={{ padding: '0 100px' }}>
            <div>
              <label className='block gray40 f-m mb2'>Client</label>
              <div className='relative'>
                <div style={iconStyle}>
                  <FilledCircle className={this.focusState('clientName')} />
                </div>
                <ClientAutocomplete
                  onFocus={this.addFocus('clientName')}
                  onBlur={this.removeFocus}
                  clients={clients}
                  className='input block'
                  name='clientName'
                  placeholder='Client'
                  clientName={clientName}
                  onSelect={onClientSelect}
                  onChange={onClientNameChange} />
              </div>
            </div>
            <div className='mt4'>
              <label className='block gray40 f-m mb2'>Key Message</label>
              <div className='relative'>
                <div style={iconStyle}>
                  <BioIcon className={this.focusState('purpose')} />
                </div>
                <textarea
                  onFocus={this.addFocus('purpose')}
                  onBlur={this.removeFocus}
                  style={{ ...inputStyle, height: '70px' }}
                  className='input block textarea'
                  type='text'
                  rows='5'
                  name='purpose'
                  value={purpose}
                  placeholder='Key Message'
                  onChange={onChange('purpose')} />
              </div>
            </div>
            <div className='mt4'>
              <label className='block gray40 f-m mb2'>Links</label>
              {links.map((link, ind) => (
                <div key={ind} className='relative mt1 icon-blue-highlight'>
                  <div style={iconStyle}>
                    <WebsiteIcon className={this.focusState(`link-${ind}`)} />
                  </div>
                  <input
                    onFocus={this.addFocus(`link-${ind}`)}
                    onBlur={callAll([this.removeFocus, this.checkLinkEmpty(ind)])}
                    style={inputStyle}
                    className='input block'
                    type='text'
                    value={links[ind]}
                    placeholder='Links'
                    onChange={onChangeLink(ind)} />
                </div>
              ))}
              <div><a href='#' className='f-xs blue underline mt1' onClick={this.addLink}>Add another link</a></div>
            </div>
          </div>
        </div>
        <div className='p4 right'>
          <button className='btn bg-completed white right' type='submit'>
            {campaign ? 'Edit' : 'Create'} Campaign
          </button>
          <button className='btn bg-transparent gray40 right mr2' type='reset'>Cancel</button>
        </div>
      </form>
    )
  }
})

export default Modal(EditCampaign)
