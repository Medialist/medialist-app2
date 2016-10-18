import React from 'react'
import moment from 'moment'

export default ({ date }) => {
  const dateTime = moment(date).format()
  const formatted = moment(Math.min(date, new Date() - 1)).fromNow()
  return <time dateTime={dateTime}>{formatted}</time>
}
