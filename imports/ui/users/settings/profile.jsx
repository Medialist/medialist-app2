import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { Form, Input, Button } from 'react-validation/lib/build/validation.rc'
import { CircleAvatar } from '../../images/avatar'
import { LockIcon, FeedContactIcon } from '../../images/icons'
import getAvatar from '../../../lib/get-avatar'
import EditableAvatarWithButtons from '../../images/editable-avatar-with-buttons'

export default React.createClass({
  propTypes: {
    user: PropTypes.object
  },
  getInitialState () {
    return {
      avatar: getAvatar(this.props.user) || '',
      name: this.props.user.profile.name || ''
    }
  },
  componentWillReceiveProps (props) {
    const avatar = getAvatar(props.user)
    const name = props.user.profile.name
    if (avatar) this.setState({ avatar })
    if (name) this.setState({ name })
  },
  onSubmit (e) {
    e.preventDefault()

    const errors = this.form.validateAll()

    if (Object.keys(errors).length) {
      return
    }

    Meteor.users.update({
      _id: Meteor.userId()
    }, {
      $set: {
        'profile.name': this.state.name,
        'profile.avatar': this.state.avatar
      }
    }, (error) => {
      if (error) {
        console.error('Failed to update user', error)
      }
    })
  },
  onFieldChange (event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  },
  onAvatarChange (e) {
    this.setState({
      avatar: e.url
    })
  },
  onAvatarError (error) {
    console.error('Failed to change avatar', error)
    console.log('TODO: toast error message')
  },
  render () {
    const user = this.props.user
    const inputStyles = {
      maxWidth: '24rem'
    }
    return (
      <Form id='profile-settings-panel' className='pt4' onSubmit={this.onSubmit} ref={(form) => { this.form = form }}>
        <div className='center my4'>
          <FeedContactIcon className='svg-icon-lg blue' />
        </div>
        <div className='center my4 bold f-xl'>Profile settings</div>
        <div className='center my4'>
          <p className='mx-auto max-width-2 center mt4 mb6'>Update your profile settings so people know who you are</p>
        </div>
        <hr className='flex-auto my4' style={{height: 1, marginRight: '-0.6rem', marginLeft: '-0.6rem'}} />
        <div className='ml-auto mr-auto w26'>
          <div className='py2'>
            <p className='block gray40 semibold f-sm mb2' htmlFor='email'>Your avatar</p>
            <EditableAvatarWithButtons avatar={this.state.avatar} onChange={this.onAvatarChange} onError={this.onAvatarError} className='mt4 mb2'>
              <CircleAvatar size={100} avatar={this.state.avatar} name={this.state.name} style={{verticalAlign: 'top'}} />
            </EditableAvatarWithButtons>
          </div>
          <div className='mb2'>
            <label className='block gray40 semibold f-sm pt4 mb2' htmlFor='name'>Full name</label>
            <Input
              name='name'
              className='input'
              errorClassName='error'
              placeholder='Your name'
              value={user.profile.name}
              style={inputStyles}
              onChange={this.onFieldChange}
              validations={['required']}
            />
          </div>
          <div className='mt2 mb4 pb4'>
            <label className='block gray40 semibold f-sm pt4 mb2' htmlFor='name'>Email address</label>
            <Input
              name='email'
              containerClassName='inline-block w24'
              className='input inline-block'
              errorClassName='error'
              placeholder={`yourname@${Meteor.settings.public.authentication.emailDomains[0]}`}
              value={user.emails[0].address}
              style={inputStyles}
              validations={['required']}
              disabled
            />
            <LockIcon className='inline-block ml2' />
          </div>
        </div>
        {insertRuler()}
        <div className='col col-12 pt2 pb4 mb2'>
          <Button
            type='submit'
            className='btn white bg-blue mx2 right'
            disabled={false}
            id='update-profile-button'
          >Save changes</Button>
        </div>
      </Form>
    )
  }
})

function insertRuler () {
  return <hr className='flex-auto my4' style={{height: 1, marginRight: '-0.6rem', marginLeft: '-0.6rem'}} />
}
