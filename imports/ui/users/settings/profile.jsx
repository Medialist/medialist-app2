import React, { PropTypes } from 'react'
import { CircleAvatar } from '../../images/avatar'
import { EmailIcon, PhoneIcon } from '../../images/icons'

export default React.createClass({
  propTypes: {
    user: PropTypes.object
  },
  getInitialState () {
    return {
      avatar: readAvatarUrl(this.props) || '',
      name: readName(this.props) || ''
    }
  },
  componentWillReceiveProps (props) {
    const avatar = readAvatarUrl(props)
    const name = readName(props)
    if (avatar) this.setState({ avatar })
    if (name) this.setState({ name })
  },
  render () {
    const user = this.props.user
    const inputStyles = {
      maxWidth: '24rem'
    }
    return (
      <article>
        <div className='flex justify-center py2'>
          <CircleAvatar avatar={this.state.avatar} size={200} className='mt4 mb2' />
        </div>
        <div className='block py2 center'>
          <div className='semibold gray10 f-xl py2'>{user.profile.name}</div>
          <div className='normal gray20'>{`Organisation name`}</div>
        </div>
        {insertRuler()}
        <div className='flex items-center justify-center mt4 mb2 pt4'>
          <label className='px2 pt4 pb2'><EmailIcon /></label>
          <input className='input p2' defaultValue={user.profile.name} style={inputStyles} />
        </div>
        <div className='flex items-center justify-center mt2 mb4 pb4'>
          <label className='p2'><PhoneIcon /></label>
          <input className='input p2' defaultValue='777 7777 7777' style={inputStyles} />
        </div>
        {insertRuler()}
        <div className='col col-12 pt2 pb4 mb2'>
          <button type='submit' className='btn white bg-blue mx2 right'>Update Profile</button>
        </div>
      </article>
    )
  }
})

function readAvatarUrl (props) {
  return (
    props.user &&
    props.user.services &&
    props.user.services.twitter &&
    props.user.services.twitter.profile_image_url_https
  )
}

function readName (props) {
  return (
    props.user &&
    props.user.profile &&
    props.user.profile.name
  )
}

function insertRuler () {
  return <hr className='flex-auto my4' style={{height: 1, marginRight: '-0.6rem', marginLeft: '-0.6rem'}} />
}
