import React from 'react'
import SettingsMasterList from '/imports/ui/users/settings/settings-master-lists'
import EditMasterLists from '/imports/ui/users/settings/edit-master-lists'

const type = 'Contacts'
const copy = 'Contact Lists help keep your Contacts organised. Look for them across the top of the Contacts page.'

const ContactsMasterLists = (props) => {
  return (
    <SettingsMasterList type={type} copy={copy} data-id='contact-lists'>
      <EditMasterLists type={type} {...props} />
    </SettingsMasterList>
  )
}

export default ContactsMasterLists
