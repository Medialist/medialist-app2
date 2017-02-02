import React from 'react'
import SettingsMasterList from './settings-master-lists'
import EditMasterLists from './edit-master-lists'

const copy = 'Contact Lists help keep your Contacts organised. Look for them across the top of the Contacts page.'

const ContactsMasterLists = (props) => {
  return (
    <SettingsMasterList title='Contact' copy={copy}>
      <EditMasterLists type='Contacts' {...props} />
    </SettingsMasterList>
  )
}

export default ContactsMasterLists
