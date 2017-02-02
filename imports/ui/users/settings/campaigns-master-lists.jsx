import React from 'react'
import SettingsMasterList from './settings-master-lists'
import EditMasterLists from './edit-master-lists'

const copy = 'Campaign Lists help keep your Campaigns organised. Look for them across the top of the Campaigns page.'

const CampaignsMasterLists = (props) => {
  return (
    <SettingsMasterList title='Campaign' copy={copy}>
      <EditMasterLists type='Campaigns' {...props} />
    </SettingsMasterList>
  )
}

export default CampaignsMasterLists
