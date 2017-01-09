import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import escapeRegExp from 'lodash.escaperegexp'
import { SearchBlueIcon } from '../images/icons'
import Modal from '../navigation/modal'
import Loading from '../lists/loading'

const EditTeam = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    campaign: PropTypes.object.isRequired,
    onDismiss: PropTypes.func.isRequired
  },

  getInitialState () {
    const { campaign } = this.props
    return { term: '', team: (campaign.team || []).slice() }
  },

  getMeteorData () {
    const { term } = this.state
    const subs = [ Meteor.subscribe('users', { term }) ]
    const loading = !subs.every((sub) => sub.ready())

    let query = {}
    const options = {
      fields: {
        'profile.name': 1,
        'services.twitter.profile_image_url_https': 1
      },
      sort: { createdAt: -1 }
    }

    if (term) {
      const regex = new RegExp(`${escapeRegExp(term)}`, 'gi')

      query = { $or: [
        { 'profile.name': regex },
        { 'services.twitter.screenName': regex }
      ] }
    }

    return { users: Meteor.users.find(query, options), loading }
  },

  onSearchTermChange (term) {
    this.setState({ term })
  },

  // Determine if the passed user is a member of the team
  isMember (user) {
    const { team } = this.state
    return (team || []).some((u) => u._id === user._id)
  },

  // Convert to a user ref
  toMember (user) {
    return {
      _id: user._id,
      name: user.profile.name,
      avatar: user.services.twitter.profile_image_url_https
    }
  },

  onToggleUser (user) {
    const { team } = this.state

    this.setState({
      team: this.isMember(user)
        ? team.filter((m) => m._id === user._id)
        : team.concat(this.toMember(user))
    })
  },

  onSubmit (e) {
    e.preventDefault()
    // TODO: update campaign
  },

  onReset (e) {
    e.preventDefault()
    this.props.onDismiss()
  },

  render () {
    const { onSearchTermChange, onToggleUser, isMember, onSubmit, onReset } = this
    const { term, team } = this.state
    const { users, loading } = this.data

    let content

    if (!loading && !users.length) {
      content = <UsersListEmpty />
    } else {
      content = (
        <div>
          <SearchBox
            term={term}
            onTermChange={onSearchTermChange} />
          <SearchResults
            users={users}
            isMember={isMember}
            onToggleUser={onToggleUser}
            loading={loading} />
        </div>
      )
    }

    return (
      <form onSubmit={onSubmit} onReset={onReset}>
        <Header team={team} />
        {content}
        <div className='p4 right-align'>
          <button className='btn bg-transparent blue mr2 left' type='button' disabled>Manage Team Mates</button>
          <button className='btn bg-transparent gray40 mr2' type='reset'>Cancel</button>
          <button className='btn bg-completed white' type='submit'>Save Changes</button>
        </div>
      </form>
    )
  }
})

const Header = () => (
  <div className='border-gray60 border-bottom'>
    <h1 className='f-xl normal center pt4 pb4'>Add Team Mates to this Campaign</h1>
  </div>
)

const UsersListEmpty = () => <div>No users :(</div>

const SearchBox = React.createClass({
  propTypes: {
    term: PropTypes.string.isRequired,
    onTermChange: PropTypes.func.isRequired
  },

  render () {
    return (
      <div className='py3 pl3 flex border-gray60 border-bottom'>
        <SearchBlueIcon className='flex-none' />
        <input className='flex-auto f-lg pa2 mx2' placeholder='Find team mates' onChange={this.props.onTermChange} style={{ outline: 'none' }} value={this.props.term} />
      </div>
    )
  }
})

const SearchResults = React.createClass({
  propTypes: {
    users: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        avatar: PropTypes.string
      })
    ),
    isMember: PropTypes.func,
    loading: PropTypes.bool,
    onToggleUser: PropTypes.func.isRequired
  },

  getDefaultProps () {
    return { isMember: () => false, loading: false }
  },

  render () {
    const { loading } = this.props
    if (loading) return <Loading />
  }
})

export default Modal(EditTeam)
