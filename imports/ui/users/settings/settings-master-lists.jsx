import React, { PropTypes } from 'react'
import { SectorIcon, FeedContactIcon } from '../../images/icons'

const icons = {
  'Campaign': <SectorIcon className='svg-icon-lg blue' />,
  'Contact': <FeedContactIcon className='svg-icon-lg blue' />
}

const SettingsPanelMasterLists = (props) => {
  const { title, copy, children } = props
  return (
    <section className='pt4'>
      <div className='center my4'>
        {icons[title]}
      </div>
      <div className='center my4 bold f-xl'>{title} Lists</div>
      <div className='center my4'>
        <p className='mx-auto max-width-2 center mt4 mb6'>{copy}</p>
      </div>
      <hr className='flex-auto my4' style={{height: 1, marginRight: '-0.6rem', marginLeft: '-0.6rem'}} />
      {children}
    </section>
  )
}

SettingsPanelMasterLists.PropTypes = {
  title: PropTypes.string.isRequired,
  copy: PropTypes.string,
  children: PropTypes.node.isRequired
}

export default SettingsPanelMasterLists
