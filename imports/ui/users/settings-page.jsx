import { Meteor } from 'meteor/meteor'
import React from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import { SettingsIcon } from '../images/icons'
import { CircleAvatar } from '../images/avatar'

const SettingsPage = React.createClass({
  getInitialState () {
    return {
      selectedMenuItem: 'profile'
    }
  },
  render () {
    return (
      <div className='flex max-width-lg mx-auto my4 pt4'>
        <div className='flex-none mr4 xs-hide sm-hide' style={{width: 250}}>
          <article>
            <label><SettingsIcon /> Settings / {this.state.selectedMenuItem}</label>
            <hr className='flex-auto mx2 py2' style={{height: 1}} />
            {userInfo(this.props.user)}
            {sideNav()}
          </article>
        </div>
        <div className='flex-auto px2 bg-white'>
          <p>settings profile box</p>
        </div>
      </div>
    )
  }
})

export default createContainer(() => {
  return { user: Meteor.user() }
}, SettingsPage)

function userInfo (user) {
  return (
    <div className='px4 py3'>
      <CircleAvatar name={user.profile.name} />
      <div className='inline-block align-middle pl2'>
        <div className='f-md semibold gray10'>{user.profile.name}</div>
        <div className='f-xs normal gray20'>{`Organisation name`}</div>
      </div>
    </div>
  )
}

function sideNav (selected) {
  return (
    <nav className='bg-white border border-gray80'>
      <div className='py4 px2 border-bottom border-gray80'>Profile</div>
      <div className='py4 px2 border-bottom border-gray80'>Change Password</div>
      <div className='py4 px2 border-bottom border-gray80'>Team</div>
      <div className='py4 px2'>Sectors</div>
    </nav>
  )
}
