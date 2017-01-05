import React, { PropTypes } from 'react'
import { SquareAvatar, CircleAvatar } from '../images/avatar'
import { BioIcon } from '../images/icons'
import InfoHeader from '../lists/info-header'
import QuickAdd from '../lists/quick-add'
import AddToMasterList from '../lists/add-to-master-list'

const CampaignInfo = React.createClass({
  propTypes: {
    campaign: PropTypes.object,
    onEditClick: PropTypes.func
  },

  getInitialState () {
    return {
      AddMasterListOpen: false
    }
  },

  onShowMoreToggleClick (e) {
    e.preventDefault()
    this.setState({ showMore: !this.state.showMore })
  },

  onAddTeamMembers (e) {
    console.log('TODO: onAddTeamMembers')
  },

  onAddSectors (e) {
    this.setState({AddMasterListOpen: true})
  },

  onDismiss () {
    this.setState({AddMasterListOpen: false})
  },

  onAddTags (e) {
    console.log('TODO: onAddTags')
  },

  render () {
    if (!this.props.campaign) return null
    const { onAddTeamMembers, onAddSectors, onAddTags, onDismiss } = this
    const { AddMasterListOpen } = this.state
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
        <AddToMasterList onDismiss={onDismiss} open={AddMasterListOpen} />
        <QuickAdd
          sectors={['Corporate', 'Media']}
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
          onAddSectors={onAddSectors}
          onAddTags={onAddTags} />
      </div>
    )
  }
})

export default CampaignInfo
