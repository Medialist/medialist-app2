import React from 'react'
import moment from 'moment'

export default ({ date, className }) => {
  const dateTime = moment(date).format()
  const formatted = moment(Math.min(date, new Date() - 1)).fromNow()
  return <time className={className} dateTime={dateTime}>{formatted}</time>
}
