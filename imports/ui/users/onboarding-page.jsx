import React from 'react'
import SignInLayout from '../sign-in/sign-in-layout'
import { Meteor } from 'meteor/meteor'
import { browserHistory } from 'react-router'
import { CircleAvatar } from '../images/avatar'
import EditableAvatarWithButtons from '../images/editable-avatar-with-buttons'
import { Form, Input, Button } from 'react-validation/lib/build/validation.rc'

const OnboardingPage = React.createClass({
  getInitialState () {
    const user = Meteor.user()

    return {
      email: user.emails[0].address,
      avatar: '',
      name: user.emails[0].address.split('@')[0]
    }
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
  onSubmit (event) {
    event.preventDefault()

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

        return
      }

      browserHistory.push('/')
    })
  },
  render () {
    const content = (
      <Form className='bg-white max-width-2 mt6 p5 mx-auto left-align shadow-2' onSubmit={this.onSubmit}>
        <p className='semibold f-sm mt0'>Almost there...</p>
        <p className='semibold f-sm mb4'>Finish creating your profile to join your teammates on Medialist</p>
        <label className='block gray40 semibold f-sm mb1' htmlFor='email'>Email address</label>
        <p className='f-sm mt1 mb4'>{this.state.email}</p>
        <p className='block gray40 semibold f-sm mb2' htmlFor='email'>Your avatar</p>
        <EditableAvatarWithButtons
          avatar={this.state.avatar}
          onChange={this.onFieldChange}
          onError={this.onAvatarError}>
          <CircleAvatar
            size={70}
            avatar={this.state.avatar}
            name={this.state.name}
            style={{verticalAlign: 'top'}}
          />
        </EditableAvatarWithButtons>

        <div className='mb6 left-align'>
          <label className='block gray40 semibold f-sm pt4 mb2' htmlFor='name'>Your name</label>
          <Input
            className='input'
            errorClassName='error'
            name='name'
            value={this.state.name}
            placeholder='Your name'
            id='onboarding-name-field'
            onChange={this.onFieldChange}
            validations={['required']}
          />
        </div>

        <div>
          <Button className='btn bg-blue white width-100' id='onboarding-save-button'>Create profile</Button>
        </div>
      </Form>
    )

    return <SignInLayout content={content} />
  }
})

export default OnboardingPage
