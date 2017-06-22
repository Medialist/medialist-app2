import React from 'react'
import PropTypes from 'prop-types'
import SignInLayout from '/imports/ui/sign-in/sign-in-layout'
import { Meteor } from 'meteor/meteor'
import { browserHistory } from 'react-router'
import { CircleAvatar } from '/imports/ui/images/avatar'
import EditableAvatarWithButtons from '/imports/ui/images/editable-avatar-with-buttons'
import { Form, Input, Button } from '@achingbrain/react-validation'
import { updateUser } from '/imports/api/users/methods'

class OnboardingPage extends React.Component {
  constructor (props, context) {
    super(props, context)

    const user = Meteor.user()

    this.state = {
      email: user.emails[0].address,
      avatar: '',
      name: user.emails[0].address.split('@')[0]
    }
  }

  onFieldChange (event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  onAvatarError (error) {
    console.error('Failed to change avatar', error)
    console.log('TODO: toast error message')
  }

  onSubmit (event) {
    event.preventDefault()

    updateUser.call({
      name: this.state.name,
      avatar: this.state.avatar || undefined
    }, (error) => {
      if (error) {
        console.error('Failed to update user', error)

        return
      }

      browserHistory.push(this.props.location.query.r || '/')
    })
  }

  render () {
    const content = (
      <Form className='bg-white max-width-2 mt6 p5 mx-auto left-align shadow-2' onSubmit={(event) => this.onSubmit(event)}>
        <p className='semibold f-sm mt0'>Almost there...</p>
        <p className='semibold f-sm mb4'>Finish creating your profile to join your teammates on Medialist</p>
        <label className='block gray40 semibold f-sm mb1' htmlFor='email'>Email address</label>
        <p className='f-sm mt1 mb4'>{this.state.email}</p>
        <p className='block gray40 semibold f-sm mb2' htmlFor='email'>Your avatar</p>
        <EditableAvatarWithButtons
          avatar={this.state.avatar}
          onChange={(event) => this.onFieldChange(event)}
          onError={(error) => this.onAvatarError(error)}>
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
            className='input placeholder-gray60'
            errorClassName='error'
            name='name'
            value={this.state.name}
            placeholder='Your name'
            data-id='onboarding-name-field'
            onChange={(event) => this.onFieldChange(event)}
            validations={['required']}
          />
        </div>

        <div>
          <Button
            className='btn bg-blue white width-100'
            data-id='onboarding-save-button'
            disabled={false}
          >Create profile</Button>
        </div>
      </Form>
    )

    return <SignInLayout content={content} />
  }
}

OnboardingPage.propTypes = {
  location: PropTypes.object
}

export default OnboardingPage
