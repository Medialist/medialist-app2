import React from 'react'
import moment from 'moment'

// format a moment as "time from now", but shorter.
// e.g [Just now, 2 h, 19 Jan, 20 Feb 2016]
function timeFromNowShortFormat (then) {
  const now = moment()
  const hoursAgo = now.diff(then, 'hours')
  if (hoursAgo < 1) return 'Just now'
  if (hoursAgo < 13) return hoursAgo + ' h'
  if (now.isSame(then, 'year')) return then.format('D MMM')
  return then.format('D MMM YYYY')
}

// Format a JS Date in our custom `timeFromNowShortFormat` style
// Date is converted to a moment, and passed to chidren as a fn, so you can
// pick a different format. See `TimeFromNow` below.
const Time = ({ date, children, ...props }) => {
  const then = moment(date)
  const isoStyle = then.format()
  const longStyle = then.format('ddd, MMM Do YYYY, h:mm a')
  const label = children && children(then) || timeFromNowShortFormat(then)
  return <time {...props} dateTime={isoStyle} title={longStyle}>{label}</time>
}

export default Time

export const TimeFromNow = (props) => (
  <Time {...props}>
    { (then) => then.fromNow() }
  </Time>
)
