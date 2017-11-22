import React from 'react'
import { StatusValues } from '/imports/api/contacts/status'

const StatusStats = ({statuses, active, onStatusClick, ...props}) => {
  return (
    <div {...props}>
      {StatusValues.map((status, i) => {
        const isActive = status === active
        return (
          <div
            key={status}
            onClick={() => onStatusClick(isActive ? null : status)}
            className={`inline-block pointer px3 border-left hover-color-trigger ${i > 0 ? 'border-gray80' : 'border-transparent'}`}>
            <div className={`${isActive ? 'blue' : 'gray20'} hover-blue normal center pb1`} style={{fontSize: 20}}>
              {statuses && statuses[status] ? statuses[status] : 0}
            </div>
            <div className={`${isActive ? 'blue' : 'gray40'} hover-blue semibold f-xxs caps center`}>
              {status}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StatusStats
