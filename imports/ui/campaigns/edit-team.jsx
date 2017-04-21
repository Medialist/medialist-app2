import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import { Link } from 'react-router'
import Modal from '../navigation/modal'
import { SearchBlueIcon, AddIcon, SelectedIcon, RemoveIcon } from '../images/icons'
import AvatarList from '../lists/avatar-list'
import { CircleAvatar } from '../images/avatar'
import Tooltip from '../navigation/tooltip'
import getAvatar from '/imports/lib/get-avatar'
import toUserRef from '/imports/lib/to-user-ref'
import withSnackbar from '../snackbar/with-snackbar'

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
    selectedTeamMates: PropTypes.array.isRequired,
    searching: PropTypes.bool
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
      <div data-id='edit-campaign-team-modal'>
        <h1 className='f-xl regular center mt6'>Add Team Mates to this Campaign</h1>
        <AvatarList items={selectedTeamMates} onRemove={onRemove} className='my4 px4' />
        <div className='py3 pl4 flex border-top border-bottom border-gray80'>
          <SearchBlueIcon className='flex-none' />
          <input className='flex-auto f-lg pa2 mx2' placeholder='Find a team mate...' onChange={onSearch} style={{outline: 'none'}} data-id='search-team-mates-input' />
        </div>
        <div style={{height: scrollableHeight, overflowY: 'scroll'}} data-id={`team-mates-table-${this.props.searching ? 'search-results' : 'unfiltered'}`}>
          <TeamMatesList
            isActive={isActive}
            onAdd={onAdd}
            onRemove={onRemove}
            teamMates={filteredTeamMates} />
          <div className='px4 py6'>
            <div className='center'>No luck? Try inviting more team mates to Medialist</div>
            <div className='center mt3'><Link to='/settings/team' className='blue bold underline'>Invite Team Mates to Medialist</Link></div>
          </div>
        </div>
        <form className='p4 border-top border-gray80 flex' onReset={onReset} onSubmit={onSubmit}>
          <div className='flex-auto center-align self-center'><Link to='/settings/team' className='blue bold'>Manage Team Mates</Link></div>
          <div className='flex-auto right-align'>
            <button className='btn bg-transparent gray40 mr2' type='reset' data-id='edit-campaign-team-cancel-button'>Cancel</button>
            <button className='btn bg-completed white px3' type='submit' data-id='edit-campaign-team-submit-button'>Save Changes</button>
          </div>
        </form>
      </div>
    )
  }
})

const AddTeamMateContainer = withSnackbar(React.createClass({
  propTypes: {
    onDismiss: PropTypes.func.isRequired,
    campaign: PropTypes.object.isRequired,
    teamMatesAll: PropTypes.array.isRequired,
    teamMates: PropTypes.array.isRequired // (Campaign team mates)
  },

  getInitialState () {
    return {
      searching: false,
      selectedTeamMates: this.props && this.props.teamMates || [],
      filteredTeamMates: this.props && this.props.teamMatesAll || []
    }
  },

  componentWillReceiveProps ({ loading, teamMatesAll }) {
    if (!loading && this.props.loading) {
      this.setState({ filteredTeamMates: teamMatesAll })
    }
  },

  // Is the user in selected teamMates list?
  isActive (teamMate) {
    return this.state.selectedTeamMates.some((t) => t._id === teamMate._id)
  },

  onAdd (contact) {
    let { selectedTeamMates } = this.state
    selectedTeamMates = selectedTeamMates.concat(toUserRef(contact))
    this.setState({ selectedTeamMates })
  },

  onSubmit (evt) {
    evt.preventDefault()
    const teamMateIds = this.state.selectedTeamMates.map((t) => t._id)
    const _id = this.props.campaign._id

    if (teamMateIds.length > 0) {
      Meteor.call('Campaigns/setTeamMates', { userIds: teamMateIds, _id }, (error) => {
        if (error) {
          console.log(error)
          this.props.snackbar.error('campaign-team-update-failure')

          return
        }

        this.props.snackbar.show(`Updated campaign team`, 'campaign-team-update-success')
      })
    }

    this.onReset()
  },

  onRemove (teamMate) {
    this.setState({
      selectedTeamMates: this.state.selectedTeamMates
        .filter((t) => t._id !== teamMate._id)
    })
  },

  onReset () {
    this.props.onDismiss()
    this.deselectAll()
  },

  onSearch (evt) {
    const term = evt.target.value
    const query = {'profile.name': {$regex: term, $options: 'i'}}
    const filteredTeamMates = Meteor.users.find(query, {limit: 20, sort: {'profile.name': 1}}).fetch()
    this.setState({
      searching: Boolean(term),
      filteredTeamMates
    })
  },

  deselectAll () {
    this.setState({selectedContacts: []})
  },

  render () {
    const props = Object.assign({}, this, this.state, this.props)
    return <AddTeamMate{...props} />
  }
}))

const AddTeamMateWrapper = createContainer((props) => {
  const sub = Meteor.subscribe('users')
  const loading = !sub.ready() || props.loading

  return {
    ...props,
    loading,
    teamMatesAll: Meteor.users.find({}, {sort: {'profile.name': 1}}).fetch()
  }
}, AddTeamMateContainer)

const TeamMatesList = React.createClass({
  propTypes: {
    isActive: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    teamMates: PropTypes.array.isRequired
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
            _id,
            profile: { name }
          } = teamMate
          const avatar = getAvatar(teamMate)
          return (
            <div className={`flex items-center pointer border-bottom border-gray80 py2 pl4 hover-bg-gray90 hover-opacity-trigger ${isActive ? 'active' : ''}`} key={_id} onClick={() => this.onClick(teamMate, isActive)} data-id={`team-mate-${teamMate._id}`}>
              <CircleAvatar avatar={avatar} name={name} />
              <div className='inline-block pl4' style={{width: '24rem'}}>
                <span className='f-xl gray40 py1'>{name}</span><br />
              </div>
              <div className='flex-none px4'>0 campaigns</div>
              <div className={`flex-none pl4 pr2 ${isActive ? '' : 'opacity-0'} hover-opacity-100`}>
                {isActive ? <SelectedIcon data-id='selected-button' /> : <AddIcon data-id='add-button' />}
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

export default Modal(AddTeamMateWrapper)
