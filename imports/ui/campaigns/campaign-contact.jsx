import React from 'react'
import { Link } from 'react-router'
import { CircleAvatar } from '../images/avatar'

const CampaignContact = (props) => (
  <div className='pt3' style={{lineHeight: 1.3}}>
    <Link to={`contact/${props.slug}`}>
      <CircleAvatar className='inline-block' size={38} avatar={props.avatar} name={props.name} />
      <div className='inline-block align-top pl3' style={{width: 220, height: 55}}>
        <div className='f-md semibold gray10 truncate'>{props.name}</div>
        <div className='f-sm normal gray20 truncate'>{props.jobTitles}</div>
        <div className='f-sm normal gray40 truncate'>{props.primaryOutlets}</div>
      </div>
    </Link>
  </div>
)

export default CampaignContact
