import React from 'react'
import SettingsMasterList from './settings-master-lists'

const copy = 'Contact Lists help keep your Contacts organised. Look for them across the top of the Contacts page.'

const ContactsMasterLists = (props) => {
  return (
    <SettingsMasterList title='Contact' copy={copy}>
      <div>masterlist in here</div>
    </SettingsMasterList>
  )
}

export default ContactsMasterLists
