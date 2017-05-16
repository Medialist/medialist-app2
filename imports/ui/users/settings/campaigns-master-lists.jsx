import React from 'react'
import SettingsMasterList from '/imports/ui/users/settings/settings-master-lists'
import EditMasterLists from '/imports/ui/users/settings/edit-master-lists'

const type = 'Campaigns'
const copy = 'Campaign Lists help keep your Campaigns organised. Look for them across the top of the Campaigns page.'

const CampaignsMasterLists = (props) => {
  return (
    <SettingsMasterList type={type} copy={copy} data-id='campaign-lists'>
      <EditMasterLists type={type} {...props} />
    </SettingsMasterList>
  )
}

export default CampaignsMasterLists
