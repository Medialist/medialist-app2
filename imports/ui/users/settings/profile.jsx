import React from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import { Form, Input, Button } from '@achingbrain/react-validation'
import { CircleAvatar } from '/imports/ui/images/avatar'
import { LockIcon } from '/imports/ui/images/icons'
import EditableAvatarWithButtons from '/imports/ui/images/editable-avatar-with-buttons'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import { update } from '/imports/api/users/methods'

export default withSnackbar(React.createClass({
  propTypes: {
    user: PropTypes.object
  },
  getInitialState () {
    return {
      avatar: this.props.user.profile.avatar,
      name: this.props.user.profile.name
    }
  },
  onSubmit (e) {
    e.preventDefault()

    const errors = this.form.validateAll()

    if (Object.keys(errors).length) {
      return
    }

    update.call({
      name: this.state.name,
      avatar: this.state.avatar ? this.state.avatar : undefined
    }, (error) => {
      if (error) {
        console.error('Failed to update profile', error)

        this.props.snackbar.error('profile-update-failure')

        return
      }

      this.props.snackbar.show('Your profile has been updated', 'profile-update-success')
    })
  },
  onFieldChange (event) {
    this.setState({
      [event.target.name]: event.target.value
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
      <Form data-id='profile-settings-panel' className='py8' onSubmit={this.onSubmit} ref={(form) => { this.form = form }}>
        <div className='ml-auto mr-auto w26'>
          <div className='py2'>
            <EditableAvatarWithButtons
              avatar={this.state.avatar}
              onChange={this.onFieldChange}
              onError={this.onAvatarError}
              className='mt4 mb2'>
              <CircleAvatar
                size={100}
                avatar={this.state.avatar}
                name={this.state.name}
                style={{verticalAlign: 'top'}}
              />
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
          <Button
            type='submit'
            className='btn white bg-blue w24'
            disabled={false}
            data-id='update-profile-button'
          >Update Profile</Button>
        </div>
      </Form>
    )
  }
}))
