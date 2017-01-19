// import React, { PropTypes } from 'react'
// import { Meteor } from 'meteor/meteor'
// import { createContainer } from 'meteor/create-container'
// import escapeRegExp from 'lodash.escaperegexp'
// import { SearchBlueIcon } from '../images/icons'
// import Modal from '../navigation/modal'
// import Loading from '../lists/loading'

// const EditTeam = React.createClass({
//   mixins: [ReactMeteorData],

//   propTypes: {
//     campaign: PropTypes.object.isRequired,
//     onDismiss: PropTypes.func.isRequired
//   },

//   getInitialState () {
//     const { campaign } = this.props
//     return { term: '', team: (campaign.team || []).slice() }
//   },

//   getMeteorData () {
//     const { term } = this.state
//     const subs = [ Meteor.subscribe('users', { term }) ]
//     const loading = !subs.every((sub) => sub.ready())

//     let query = {}
//     const options = {
//       fields: {
//         'profile.name': 1,
//         'services.twitter.profile_image_url_https': 1
//       },
//       sort: { createdAt: -1 }
//     }

//     if (term) {
//       const regex = new RegExp(`${escapeRegExp(term)}`, 'gi')

//       query = { $or: [
//         { 'profile.name': regex },
//         { 'services.twitter.screenName': regex }
//       ] }
//     }

//     return { users: Meteor.users.find(query, options), loading }
//   },

//   onSearchTermChange (term) {
//     this.setState({ term })
//   },

//   // Determine if the passed user is a member of the team
//   isMember (user) {
//     const { team } = this.state
//     return (team || []).some((u) => u._id === user._id)
//   },

//   // Convert to a user ref
//   toMember (user) {
//     return {
//       _id: user._id,
//       name: user.profile.name,
//       avatar: user.services.twitter.profile_image_url_https
//     }
//   },

//   onToggleUser (user) {
//     const { team } = this.state

//     this.setState({
//       team: this.isMember(user)
//         ? team.filter((m) => m._id === user._id)
//         : team.concat(this.toMember(user))
//     })
//   },

//   onSubmit (e) {
//     e.preventDefault()
//     // TODO: update campaign
//   },

//   onReset (e) {
//     e.preventDefault()
//     this.props.onDismiss()
//   },

//   render () {
//     const { onSearchTermChange, onToggleUser, isMember, onSubmit, onReset } = this
//     const { term, team } = this.state
//     const { users, loading } = this.data

//     let content

//     if (!loading && !users.length) {
//       content = <UsersListEmpty />
//     } else {
//       content = (
//         <div>
//           <SearchBox
//             term={term}
//             onTermChange={onSearchTermChange} />
//           <SearchResults
//             users={users}
//             isMember={isMember}
//             onToggleUser={onToggleUser}
//             loading={loading} />
//         </div>
//       )
//     }

//     return (
//       <form onSubmit={onSubmit} onReset={onReset}>
//         <Header team={team} />
//         {content}
//         <div className='p4 right-align'>
//           <button className='btn bg-transparent blue mr2 left' type='button' disabled>Manage Team Mates</button>
//           <button className='btn bg-transparent gray40 mr2' type='reset'>Cancel</button>
//           <button className='btn bg-completed white' type='submit'>Save Changes</button>
//         </div>
//       </form>
//     )
//   }
// })

// const Header = () => (
//   <div className='border-gray60 border-bottom'>
//     <h1 className='f-xl normal center pt4 pb4'>Add Team Mates to this Campaign</h1>
//   </div>
// )

// const UsersListEmpty = () => <div>No users :(</div>

// const SearchBox = React.createClass({
//   propTypes: {
//     term: PropTypes.string.isRequired,
//     onTermChange: PropTypes.func.isRequired
//   },

//   render () {
//     return (
//       <div className='py3 pl3 flex border-gray60 border-bottom'>
//         <SearchBlueIcon className='flex-none' />
//         <input className='flex-auto f-lg pa2 mx2' placeholder='Find team mates' onChange={this.props.onTermChange} style={{ outline: 'none' }} value={this.props.term} />
//       </div>
//     )
//   }
// })

// const SearchResults = React.createClass({
//   propTypes: {
//     users: PropTypes.arrayOf(
//       PropTypes.shape({
//         _id: PropTypes.string.isRequired,
//         name: PropTypes.string.isRequired,
//         avatar: PropTypes.string
//       })
//     ),
//     isMember: PropTypes.func,
//     loading: PropTypes.bool,
//     onToggleUser: PropTypes.func.isRequired
//   },

//   getDefaultProps () {
//     return { isMember: () => false, loading: false }
//   },

//   render () {
//     const { loading } = this.props
//     if (loading) return <Loading />
//   }
// })

// export default Modal(EditTeam)

// *************************

import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { Link } from 'react-router'
import Modal from '../navigation/modal'
import { SearchBlueIcon, AddIcon, SelectedIcon, RemoveIcon } from '../images/icons'
import AvatarList from '../lists/avatar-list'
import { CircleAvatar } from '../images/avatar'
import Tooltip from '../navigation/tooltip'

function truncate (str, chars) {
  if (str.length <= chars) return str
  return str.substring(0, chars) + '...'
}

const AddTeamMate = React.createClass({
  PropTypes: {
    onSubmit: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onStatusChange: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    isActive: PropTypes.func.isRequired,
    teamMatesAll: PropTypes.object.isRequired,
    filteredTeamMates: PropTypes.array,
    selectedTeamMates: PropTypes.array.isRequired
  },

  render () {
    const {
      onReset,
      onSubmit,
      selectedTeamMates,
      filteredTeamMates,
      onSearch,
      onAdd,
      onRemove,
      isActive
    } = this.props

    const scrollableHeight = Math.max(window.innerHeight - 380, 80)

    return (
      <div>
        <h1 className='f-xl regular center mt6'>Add Team Mates to this Campaign</h1>
        <AvatarList items={selectedTeamMates} onRemove={onRemove} className='my4 px4' />
        <div className='py3 pl4 flex border-top border-bottom border-gray80'>
          <SearchBlueIcon className='flex-none' />
          <input className='flex-auto f-lg pa2 mx2' placeholder='Find a team mate...' onChange={onSearch} style={{outline: 'none'}} />
        </div>
        <div style={{height: scrollableHeight, overflowY: 'scroll'}}>
          <TeamMatesList
            isActive={isActive}
            onAdd={onAdd}
            onRemove={onRemove}
            teamMates={filteredTeamMates} />
        </div>
        <form className='py4 border-top border-gray80 flex' onReset={onReset} onSubmit={onSubmit}>
          <div className='flex-auto right-align'>
            <button className='btn bg-transparent gray40 mr2' type='reset'>Cancel</button>
            <button className='btn bg-completed white px3 mr4' type='submit'>Save Changes</button>
          </div>
        </form>
      </div>
    )
  }
})

const AddTeamMateContainer = React.createClass({
  propTypes: {
    onDismiss: PropTypes.func.isRequired,
    campaign: PropTypes.object.isRequired,
    teamMatesAll: PropTypes.array.isRequired,
    teamMates: PropTypes.array.isRequired // (Campaign team mates)
  },

  getInitialState () {
    return {
      selectedTeamMates: [],
      filteredTeamMates: this.props && this.props.teamMatesAll || []
    }
  },

  // Is the contact in the campaign or in selected teamMates list?
  isActive (contact) {
    const { teamMates } = this.props
    const { selectedTeamMates } = this.state
    const activeContacts = teamMates.concat(selectedTeamMates)
    return activeContacts.some((c) => c._id === contact._id)
  },

  onAdd (contact) {
    let { selectedTeamMates } = this.state
    selectedTeamMates = selectedTeamMates.concat(contact)
    this.setState({ selectedTeamMates })
  },

  onSubmit (evt) {
    evt.preventDefault()
    const contactSlugs = this.state.selectedTeamMates.map((c) => c.slug)
    const campaignSlug = this.props.campaign.slug
    if (contactSlugs.length > 0) Meteor.call('teamMates/addToMedialist', contactSlugs, campaignSlug)
    this.onReset()
  },

  onRemove (contact) {
    let { selectedTeamMates } = this.state

    if (selectedTeamMates.some((c) => c._id === contact._id)) {
      selectedTeamMates = selectedTeamMates.filter((c) => c._id !== contact._id)
      this.setState({ selectedTeamMates })
    } else {
      Meteor.call('teamMates/removeFromMedialist', contact.slug, this.props.campaign.slug)
    }
  },

  onReset () {
    this.props.onDismiss()
    this.deselectAll()
  },

  onSearch (evt) {
    const term = evt.target.value
    const query = {name: {$regex: `^${term}`, $options: 'i'}}
    const filteredTeamMates = window.Contacts.find(query, {limit: 20, sort: {name: 1}}).fetch()
    this.setState({filteredTeamMates})
  },

  deselectAll () {
    this.setState({selectedContacts: []})
  },

  render () {
    const props = Object.assign({}, this, this.state, this.props)
    return <AddTeamMate{...props} />
  }
})

export default Modal(AddTeamMateContainer)

const TeamMatesList = React.createClass({
  propTypes: {
    isActive: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
  },

  onClick (teamMate, isActive) {
    const { onAdd, onRemove } = this.props
    return isActive ? onRemove(teamMate) : onAdd(teamMate)
  },

  render () {
    const { teamMates } = this.props

    return (
      <div>
        {teamMates.map((teamMate) => {
          const isActive = this.props.isActive(teamMate)
          const {
            slug,
            avatar,
            name,
            outlets,
            medialists
          } = teamMate
          return (
            <div className={`flex items-center pointer border-bottom border-gray80 py2 pl4 hover-bg-gray90 hover-opacity-trigger ${isActive ? 'active' : ''}`} key={slug} onClick={() => this.onClick(contact, isActive)}>
              <CircleAvatar avatar={avatar} name={name} />
              <div className='inline-block pl4' style={{width: '24rem'}}>
                <span className='f-xl gray40 py1'>{name}</span><br />
                <span className='gray60 py1'>{(outlets && outlets.length) ? outlets[0].value : null}</span><br />
                <span className='gray60 py1'>{truncate(outlets.map((o) => o.label).join(', '), 30)}</span>
              </div>
              <div className='flex-none px4'>{medialists.length} campaigns</div>
              <div className={`flex-none pl4 pr2 ${isActive ? '' : 'opacity-0'} hover-opacity-100`}>
                {isActive ? <SelectedIcon /> : <AddIcon />}
              </div>
              <div className={`flex-none pl2 pr4 ${isActive ? 'hover-opacity-100' : 'opacity-0'} gray20 hover-fill-trigger`}>
                {isActive ? <Tooltip title='Remove'><RemoveIcon /></Tooltip> : <RemoveIcon />}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
})
