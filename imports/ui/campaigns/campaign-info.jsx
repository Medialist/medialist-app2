import React, { PropTypes } from 'react'
import { SquareAvatar, CircleAvatar } from '../images/avatar'
import { BioIcon } from '../images/icons'
import Tag from '../navigation/tag'

const InfoHeader = (props) => (
  <div className='clearfix p2 pt4 mt4 border-gray80 border-bottom'>
    <span className='pointer f-xs blue right' onClick={props.onClick}>{props.linkText || 'Add'}</span>
    <h1 className='m0 f-md normal gray20 left'>{props.name}</h1>
  </div>
)

const CampaignInfo = React.createClass({
  propTypes: {
    campaign: PropTypes.object,
    onEditClick: PropTypes.func
  },

  onShowMoreToggleClick (e) {
    e.preventDefault()
    this.setState({ showMore: !this.state.showMore })
  },

  onAddTeamMembers (e) {
    console.log('TODO: onAddTeamMembers')
  },

  onAddSectors (e) {
    console.log('TODO: onAddSectors')
  },

  onAddTags (e) {
    console.log('TODO: onAddTags')
  },

  render () {
    if (!this.props.campaign) return null
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
          <InfoHeader name='Key Message' linkText='Edit campaign' onClick={this.props.onEditClick} />
          <div className='px2 py3'>
            <BioIcon className='inline-block' />
            <div className='inline-block pl3 f-sm gray10'>{purpose}</div>
          </div>
        </section>
        <section>
          <InfoHeader name='Team Members' onClick={this.props.onAddTeamMembers} />
          <div className='px2 py3'>
            <CircleAvatar style={{margin: '0 2px 2px 0'}} name={'fake one'} size={38} />
            <CircleAvatar name={'other one'} size={38} />
          </div>
        </section>
        <section>
          <InfoHeader name='Sectors' onClick={this.props.onAddSectors} />
          <div className='py3'>
            <span className='pointer p2 blue f-sm'>Corporate</span>
          </div>
        </section>
        <section>
          <InfoHeader name='Tags' onClick={this.props.onAddTags} />
          <div className='px2 py3'>
            <Tag name='amazon' count='43' onClick={() => console.log('tag clicked')} />
            <Tag name='e-commerce' count='8' onClick={() => console.log('tag clicked')} />
            <Tag name='retail' count='14' onClick={() => console.log('tag clicked')} />
          </div>
        </section>
      </div>
    )
  }
})

export default CampaignInfo
