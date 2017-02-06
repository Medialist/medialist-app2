import React, { PropTypes } from 'react'
import { SectorIcon, FeedContactIcon } from '../../images/icons'

const SettingsPanelMasterLists = (props) => {
  const { type, copy, children } = props
  const Icon = type === 'Contacts' ? FeedContactIcon : SectorIcon
  return (
    <section className='pt4'>
      <div className='center my4'>
        <Icon className='svg-icon-lg blue' />
      </div>
      <div className='center my4 bold f-xl'>{type.substring(0, type.length - 1)} Lists</div>
      <div className='center my4'>
        <p className='mx-auto max-width-2 center mt4 mb6'>{copy}</p>
      </div>
      <hr className='flex-auto my4' style={{height: 1, marginRight: '-0.6rem', marginLeft: '-0.6rem'}} />
      {children}
    </section>
  )
}

SettingsPanelMasterLists.PropTypes = {
  type: PropTypes.oneOf(['Contacts', 'Campaigns']).isRequired,
  copy: PropTypes.string,
  children: PropTypes.node.isRequired
}

export default SettingsPanelMasterLists
