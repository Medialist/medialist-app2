import React, { PropTypes } from 'react'
import { CameraIcon, BioIcon, WebsiteIcon, FilledCircle } from '../images/icons'
import Modal from '../navigation/modal'
import EditableAvatar from '../images/editable-avatar'
import ClientAutocomplete from './client-autocomplete'
import { create } from '/imports/api/medialists/methods'
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
      links: ['']
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
    const { avatar, name, purpose, clientName } = this.state
    const payload = {
      avatar,
      name,
      purpose,
      clientName
    }
    create.call(payload, (err) => {
      if (err) return console.log(err)
      this.props.onDismiss()
    })
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
    const { clients } = this.props
    const { avatar, name, purpose, clientName, links } = this.state
    const iconWidth = 50
    const inputStyle = { resize: 'none' }
    const iconStyle = { width: iconWidth }
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
        <div className='bg-gray90 border-top border-gray80 py5'>
          <div className='flex flex-column content-stretch px8'>
            <div className='flex'>
              <div style={iconStyle} />
              <label className='block gray40 f-m'>Client</label>
              <div style={iconStyle} />
            </div>
            <div className='flex items-stretch mt1'>
              <div style={iconStyle} className='flex justify-end items-center flex-none pr3'>
                <FilledCircle className={this.focusState('clientName')} />
              </div>
              <div className='flex-auto'>
                <ClientAutocomplete
                  onFocus={this.addFocus('clientName')}
                  onBlur={this.removeFocus}
                  clients={clients}
                  style={{display: 'block'}}
                  className='input block'
                  name='clientName'
                  placeholder='Client'
                  clientName={clientName}
                  onSelect={onClientSelect}
                  onChange={onClientNameChange} />
              </div>
              <div style={iconStyle} />
            </div>
            <div className='flex mt3'>
              <div style={iconStyle} />
              <label className='block gray40 f-m'>Key Message</label>
              <div style={iconStyle} />
            </div>
            <div className='flex items-stretch mt1'>
              <div style={iconStyle} className='flex justify-end items-center flex-none pr3'>
                <BioIcon className={this.focusState('purpose')} />
              </div>
              <div className='flex-auto'>
                <textarea
                  onFocus={this.addFocus('purpose')}
                  onBlur={this.removeFocus}
                  style={inputStyle}
                  className='input block textarea'
                  type='text'
                  rows='5'
                  name='purpose'
                  value={purpose}
                  placeholder='Key Message'
                  onChange={onChange('purpose')} />
              </div>
              <div style={iconStyle} />
            </div>
            <div className='flex mt3'>
              <div style={iconStyle} />
              <label className='block gray40 f-m'>Links</label>
              <div style={iconStyle} />
            </div>
            {this.state.links.map((link, ind) => (
              <div key={ind} className='flex items-stretch mt1 icon-blue-highlight'>
                <div style={iconStyle} className='flex justify-end items-center flex-none pr3'>
                  <WebsiteIcon className={this.focusState(`link-${ind}`)} />
                </div>
                <div className='flex-auto'>
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
                <div style={iconStyle} />
              </div>
            ))}
            <div className='flex mt1'>
              <div style={iconStyle} />
              <div><a href='#' className='f-xs blue underline' onClick={this.addLink}>Add another link</a></div>
            </div>
          </div>
        </div>
        <div className='p4 right'>
          <button className='btn bg-completed white right' type='submit'>Create Campaign</button>
          <button className='btn bg-transparent gray40 right mr2' type='reset'>Cancel</button>
        </div>
      </form>
    )
  }
})

export default Modal(EditCampaign)
