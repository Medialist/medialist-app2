import React from 'react'
import PropTypes from 'prop-types'
import { ListIcon } from '/imports/ui/images/icons'

const SettingsPanelMasterLists = (props) => {
  const { type, copy, children } = props
  return (
    <section className='pt4' data-id={props['data-id']}>
      <div className='center my4'>
        <ListIcon className='svg-icon-lg blue' style={{width: '24px', height: '24px'}} />
      </div>
      <div className='center my4 bold grey10 f-xxl'>{type.substring(0, type.length - 1)} Lists</div>
      <div className='center my4'>
        <p className='mx-auto max-width-2 grey20 center mt4 mb6 f-lg'>{copy}</p>
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
