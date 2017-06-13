import React from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import Modal from '/imports/ui/navigation/modal'
import { SearchBlueIcon, AddIcon, SelectedIcon, EmailIcon } from '/imports/ui/images/icons'
import AvatarList from '/imports/ui/lists/avatar-list'
import { CircleAvatar } from '/imports/ui/images/avatar'
import toUserRef from '/imports/lib/to-user-ref'
import { setTeamMates } from '/imports/api/campaigns/methods'
import { Form, Input, Button } from '@achingbrain/react-validation'
import createSearchContainer from '/imports/ui/lists/searchable-list'
import immutable from 'object-path-immutable'
import Loading from '/imports/ui/lists/loading'
import Scroll from '/imports/ui/navigation/scroll'
import { STATUS_GREEN } from '/imports/ui/colours'
import { SIGNIN_EMAIL_DOMAIN_HINT } from '/imports/ui/forms/validation'

class EditTeam extends React.Component {
  constructor (props, context) {
    super(props, context)

    this.state = {
      selectedItems: [].concat(this.props.initialItems),
      emails: ''
    }
  }

  onChange (event) {
    this.props.onTermChange(event.target.value)
  }

  onKeyPress (event) {
    if (event.key !== 'Enter') {
      return
    }

    if (!this.props.term) {
      return
    }

    const teamMate = this.props.items[0]

    if (!teamMate || this.props.isSelected(teamMate)) return

    this.props.onAdd(teamMate)
    this.props.onTermChange('')
  }

  isSelected (teamMate) {
    return this.state.selectedItems.some((t) => t._id === teamMate._id)
  }

  isSelectable (teamMate) {
    // return !this.props.initialItems.some((t) => t._id === teamMate._id)
    return true
  }

  onAdd (teamMate) {
    this.setState({
      selectedItems: this.state.selectedItems.concat(toUserRef(teamMate))
    })
  }

  onRemove (teamMate) {
    this.setState({
      selectedItems: this.state.selectedItems
        .filter((t) => t._id !== teamMate._id)
    })
  }

  onSubmit (event) {
    event.preventDefault()

    const errors = this.form.validateAll()

    if (Object.keys(errors).length) {
      return
    }

    const emails = this.state.emails
      .split(',')
      .map(e => e.trim())
      .filter(e => !!e)

    this.props.onSave(this.state.selectedItems, emails)
  }

  onReset (event) {
    event.preventDefault()
    this.props.onCancel()
    this.deselectAll()
  }

  onSearch (event) {
    this.props.onTermChange(event)
  }

  deselectAll () {
    this.setState({selectedItems: []})
  }

  onFieldChange (event) {
    const { name, value } = event.target
    this.setState((s) => immutable.set(s, name, value))
  }

  render () {
    return (
      <Form data-id='edit-campaign-team-modal' onReset={(event) => this.onReset(event)} onSubmit={(event) => this.onSubmit(event)} ref={(form) => { this.form = form }}>
        <h1 className='f-xl regular center mt6'>Invite Teammates to this Campaign</h1>
        <AvatarList items={this.state.selectedItems} onRemove={(event) => this.onRemove(event)} className='my4 px4' />
        <div className='py3 pl4 flex border-top border-bottom border-gray80'>
          <SearchBlueIcon className='flex-none' />
          <input
            className='flex-auto f-lg pa2 mx2 placeholder-gray60'
            placeholder='Find a teammate...'
            name='term'
            onChange={(event) => this.onSearch(event)}
            onKeyPress={(event) => this.onKeyPress(event)}
            style={{outline: 'none'}}
            data-id='search-team-mates-input' />
        </div>
        <Scroll height={'calc(95vh - 380px)'}>
          {this.props.loading && (
            <div className='center p4'>
              <Loading />
            </div>
          )}
          {!this.props.loading && (
            <TeamMatesList
              isSelected={(teamMate) => this.isSelected(teamMate)}
              isSelectable={(teamMate) => this.isSelectable(teamMate)}
              onAdd={(event) => this.onAdd(event)}
              onRemove={(event) => this.onRemove(event)}
              teamMates={this.props.items}
              searching={this.props.searching} />
          )}
        </Scroll>
        <div className='px4 border-top border-gray80'>
          <div className='mb3'>
            <EmailIcon style={{position: 'relative', top: '27px', left: '10px'}} />
            <Input
              containerClassName='gray40'
              className='input f-lg p2 pl7 mb3 block width-100 placeholder-gray60'
              errorClassName='error'
              name='emails'
              value={this.state.emails}
              placeholder='Not listed above? Invite by email address'
              onChange={(event) => this.onFieldChange(event)}
              data-id='invite-by-email-input'
              validations={['signInEmailList']}
              style={{outline: 'none', padding: '10px', paddingLeft: '35px'}}
              help={<p className='grey20 f-sm mt1'>You can only invite colleages with a {SIGNIN_EMAIL_DOMAIN_HINT} address at present</p>}
              />
          </div>
        </div>
        <div className='p4 border-top border-gray80 right-align'>
          <Button
            className='btn bg-transparent gray40 mr2'
            type='reset'
            data-id='edit-campaign-team-cancel-button'
            disabled={false}>Cancel</Button>
          <Button
            className='btn bg-completed white px3'
            type='submit'
            data-id='edit-campaign-team-submit-button'
            disabled={false}>Invite Teammates</Button>
        </div>
      </Form>
    )
  }
}

EditTeam.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,

  // SearchableTeamList
  term: PropTypes.string,
  items: PropTypes.array.isRequired,
  allItems: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  searching: PropTypes.bool.isRequired,
  onTermChange: PropTypes.func.isRequired,

  // EditTeamContainer
  initialItems: PropTypes.array.isRequired
}

const SearchableTeamList = createSearchContainer(EditTeam)

class EditTeamContainer extends React.Component {
  onSave (teamMates, emails) {
    const teamMateIds = teamMates.map((t) => t._id)
    const _id = this.props.campaign._id

    setTeamMates.call({
      _id,
      userIds: teamMateIds,
      emails
    }, (error) => {
      if (error) {
        console.log(error)
        this.context.snackbar.error('campaign-team-update-failure')

        return
      }

      this.context.snackbar.show(`Updated campaign team`, 'campaign-team-update-success')

      this.props.onDismiss()
    })
  }

  onCancel () {
    this.props.onDismiss()
  }

  render () {
    const query = {
      '$or': [{
        'profile.name': {
          $regex: '$term',
          $options: 'i'
        }
      }, {
        'emails.address': {
          $regex: '$term',
          $options: 'i'
        }
      }]
    }

    const fields = {
      'profile.name': 1,
      'profile.avatar': 1,
      'onCampaigns': 1,
      'emails': 1
    }

    return (
      <SearchableTeamList
        query={query}
        fields={fields}
        collection='users'
        allItems={Meteor.users.find({}, {sort: {'profile.name': 1}}).fetch()}
        initialItems={this.props.campaign.team}
        onCancel={() => this.onCancel()}
        onSave={(teamMates, emails) => this.onSave(teamMates, emails)}
      />
    )
  }
}

EditTeamContainer.propTypes = {
  campaign: PropTypes.object.isRequired
}

EditTeamContainer.contextTypes = {
  snackbar: PropTypes.shape({
    show: PropTypes.func.isRequired,
    error: PropTypes.func.isRequired
  }).isRequired
}

export default Modal(EditTeamContainer, {
  'data-id': 'edit-campaign-team-modal'
})

class TeamMatesList extends React.Component {
  onClick (teamMate, isActive) {
    return isActive ? this.props.onRemove(teamMate) : this.props.onAdd(teamMate)
  }

  render () {
    if (!this.props.teamMates.length) {
      return (
        <div className='px4 py8'>
          <div className='center pt4 pb6'><SearchBlueIcon style={{height: '50px', width: '50px'}} /></div>
          <div className='center'><strong>None of your teammates match your search.</strong></div>
          <div className='center mt3'>Please check your search or you can invite them via email address below</div>
        </div>
      )
    }

    return (
      <div data-id={`team-mates-table-${this.props.searching ? 'search-results' : 'unfiltered'}`}>
        {this.props.teamMates.map((user) => {
          const isSelected = this.props.isSelected(user)
          const isSelectable = this.props.isSelectable(user)

          if (isSelected) {
            return <SelectedTeamMember teamMember={user} onClick={(event) => this.onClick(event, true)} key={user._id} />
          }

          if (isSelectable) {
            return <SelectableTeamMember teamMember={user} onClick={(event) => this.onClick(event, false)} key={user._id} />
          }

          return <UnselectabledTeamMember teamMember={user} key={user._id} />
        })}
      </div>
    )
  }
}

TeamMatesList.propTypes = {
  isSelected: PropTypes.func.isRequired,
  isSelectable: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  teamMates: PropTypes.array.isRequired,
  searching: PropTypes.bool.isRequired
}

const SelectableTeamMember = ({teamMember, onClick}) => {
  return (
    <div className='flex items-center border-bottom border-gray80 py2 pl4 pointer hover-bg-gray90 hover-color-trigger hover-opacity-trigger'
      onClick={() => onClick(teamMember, false)}>
      <div className='flex-auto'>
        <TeamMember teamMember={teamMember} />
      </div>
      <div className='flex-none px4 f-sm gray40 hover-gray20'>
        {`${teamMember.onCampaigns} ${teamMember.onCampaigns === 1 ? 'campaign' : 'campaigns'}`}
      </div>
      <div className='flex-none px4 opacity-0 hover-opacity-100'>
        <AddIcon data-id='add-button' style={{fill: STATUS_GREEN}} />
      </div>
    </div>
  )
}

const SelectedTeamMember = ({teamMember, onClick}) => {
  return (
    <div className='flex items-center border-bottom border-gray80 py2 pl4 active pointer hover-bg-gray90 hover-color-trigger hover-opacity-trigger'
      onClick={() => onClick(teamMember, true)}>
      <div className='flex-auto'>
        <TeamMember teamMember={teamMember} highlighted />
      </div>
      <div className='flex-none px4 f-sm gray40 hover-gray20'>
        {`${teamMember.onCampaigns} ${teamMember.onCampaigns === 1 ? 'campaign' : 'campaigns'}`}
      </div>
      <div className='flex-none px4 hover-opacity-100'>
        <SelectedIcon data-id='selected-button' style={{fill: STATUS_GREEN}} />
      </div>
    </div>
  )
}

const UnselectabledTeamMember = ({teamMember}) => {
  return (
    <div className='flex items-center border-bottom border-gray80 py2 pl4 opacity-50'>
      <div className='flex-auto'>
        <TeamMember teamMember={teamMember} highlighted />
      </div>
      <div className='flex-none px4 f-sm gray40'>
        Already on campaign team
      </div>
      <div className='flex-none px4'>
        <SelectedIcon style={{fill: STATUS_GREEN}} />
      </div>
    </div>
  )
}

const TeamMember = ({ teamMember, campaign, style, highlighted, ...props }) => {
  return (
    <div style={{lineHeight: 1.3, ...style}} {...props}>
      <CircleAvatar className='inline-block' size={38} avatar={teamMember.profile.avatar} name={teamMember.profile.name} />
      <div className='inline-block align-top pl3' style={{width: 220}}>
        <div className='flex items-center'>
          <div className={`flex-none f-md semibold ${highlighted ? 'completed' : 'gray10'}`}>{teamMember.profile.name || 'Invited'}</div>
        </div>
        {teamMember.emails && teamMember.emails.length && <div className='f-sm normal gray20 truncate'>{teamMember.emails[0].address}</div>}
        {(!teamMember.emails || !teamMember.emails.length) && <div className='f-sm normal gray60 truncate'>No email address</div>}
      </div>
    </div>
  )
}

TeamMember.propTypes = {
  teamMember: PropTypes.object.isRequired,
  campaign: PropTypes.object
}
