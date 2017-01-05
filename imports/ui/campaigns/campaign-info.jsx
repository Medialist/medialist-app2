import React, { PropTypes } from 'react'
import { SquareAvatar, CircleAvatar } from '../images/avatar'
import { BioIcon } from '../images/icons'
import InfoHeader from '../lists/info-header'
import QuickAdd from '../lists/quick-add'
import AddToMasterList from '../lists/add-to-master-list'

// Dummy data to be replaced with subscription data
const usersMasterLists = [
  {_id: 0, label: 'Healthcare', slug: 'healthcare'},
  {_id: 0, label: 'Energy', slug: 'energy'}
]
const allMasterLists = [
  {_id: 0, label: 'Energy', slug: 'energy', count: 12},
  {_id: 0, label: 'Healthcare', slug: 'healthcare', count: 3},
  {_id: 0, label: 'Personal Fitness', slug: 'personal-fitness', count: 1},
  {_id: 0, label: 'Robotics', slug: 'robotics', count: 15},
  {_id: 0, label: 'Technology', slug: 'technology', count: 8},
  {_id: 0, label: 'Money and Glory', slug: 'money-and-glory'},
  {_id: 0, label: 'Quietness', slug: 'quietness'},
  {_id: 0, label: 'Fashion Bloggers', slug: 'fashion-bloggers', count: 7}
]
// END of dummy data

const CampaignInfo = React.createClass({
  propTypes: {
    campaign: PropTypes.object,
    onEditClick: PropTypes.func
  },

  getInitialState () {
    return {
      addToMasterListOpen: false
    }
  },

  onShowMoreToggleClick (e) {
    e.preventDefault()
    this.setState({ showMore: !this.state.showMore })
  },

  onAddTeamMembers (e) {
    console.log('TODO: onAddTeamMembers')
  },

  onAddToMasterList (e) {
    this.setState({addToMasterListOpen: true})
  },

  dismissAddToMasterList () {
    this.setState({addToMasterListOpen: false})
  },

  updateMasterList (payload) {
    console.log(payload)
  },

  onAddTags (e) {
    console.log('TODO: onAddTags')
  },

  render () {
    if (!this.props.campaign) return null
    const { onAddTeamMembers, onAddToMasterList, onAddTags, dismissAddToMasterList, updateMasterList } = this
    const { addToMasterListOpen } = this.state
    const { onEditClick } = this.props
    const { name, avatar, purpose } = this.props.campaign
    return (
      <div>
        <div className='mb1'>
          <SquareAvatar className='ml2' size={70} avatar={avatar} name={name} />
          <div className='ml3 inline-block align-middle'>
            <span className='semibold block f-xl mb1'>{name}</span>
          </div>
        </div>
        <section>
          <InfoHeader name='Key Message' linkText='Edit campaign' onClick={onEditClick} />
          <div className='px2 py3'>
            <BioIcon className='inline-block' />
            <div className='inline-block pl3 f-sm gray10'>{purpose}</div>
          </div>
        </section>
        <section>
          <InfoHeader name='Team Members' onClick={onAddTeamMembers} />
          <div className='px2 py3'>
            <CircleAvatar style={{margin: '0 2px 2px 0'}} name={'fake one'} size={38} />
            <CircleAvatar name={'other one'} size={38} />
          </div>
        </section>
        <AddToMasterList
          open={addToMasterListOpen}
          onDismiss={dismissAddToMasterList}
          onSave={updateMasterList}
          currentlyBelongsTo={usersMasterLists}
          masterLists={allMasterLists}
          title='Campaign' />
        <QuickAdd
          usersMasterLists={usersMasterLists}
          tags={[
            {
              _id: 'mongoidforamazon',
              name: 'Amazon',
              count: 43
            },
            {
              _id: 'mongoidforretail',
              name: 'Retail',
              count: 13
            }
          ]}
          onAddToMasterList={onAddToMasterList}
          onAddTags={onAddTags} />
      </div>
    )
  }
})

export default CampaignInfo
