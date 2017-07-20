import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

// format a moment as "time from now", but shorter.
// e.g [Just now, 2 h, 19 Jan, 20 Feb 2016]
export function timeFromNowShortFormat (then) {
  then = moment(then)

  const now = moment()
  const secondsAgo = now.diff(then, 'seconds')

  if (secondsAgo < 60) {
    return 'Just now'
  }

  const minutesAgo = now.diff(then, 'minutes')

  if (minutesAgo < 60) {
    return `${minutesAgo}mins`
  }

  const hoursAgo = now.diff(then, 'hours')

  // if it's after midnight but before 4am show 'hours ago'.
  // 4am is the limit because nothing good ever happens after 4am.
  if (now.isSame(then, 'day') || hoursAgo < 4) {
    return `${hoursAgo}h`
  }

  if (now.isSame(then, 'year')) {
    return then.format('D MMM')
  }

  return then.format('D MMM YYYY')
}

// Format a JS Date in our custom `timeFromNowShortFormat` style
// Keeps the formatted label up to date if < 24 hours young/old
class Time extends Component {
  static propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    format: PropTypes.func,
    isRecent: PropTypes.func
  }

  static defaultProps = {
    format: timeFromNowShortFormat,
    isRecent (date) {
      const isRecentPast = moment().subtract(1, 'day').isBefore(date)
      const isRecentFuture = moment().add(1, 'day').isAfter(date)
      return isRecentPast || isRecentFuture
    }
  }

  constructor (props) {
    super(props)
    this.state = { formattedTime: props.format(props.date) }
    this.setInterval(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.setFormattedTime(nextProps)
    this.setInterval(nextProps)
  }

  componentWillUnmount () {
    clearInterval(this.intervalId)
  }

  setInterval ({ date, isRecent }) {
    clearInterval(this.intervalId)

    if (isRecent(date)) {
      this.intervalId = setInterval(this.onInterval, 1000)
    }
  }

  onInterval = () => {
    this.setFormattedTime(this.props)

    if (!this.props.isRecent(this.props.date)) {
      clearInterval(this.intervalId)
    }
  }

  setFormattedTime ({ format, date }) {
    const formattedTime = format(date)
    if (formattedTime !== this.state.formattedTime) {
      this.setState({ formattedTime })
    }
  }

  render () {
    const { date, format, ...props } = this.props // eslint-disable-line no-unused-vars
    const { formattedTime } = this.state
    const then = moment(date)
    const isoStyle = then.format()
    const longStyle = then.format('ddd, MMM Do YYYY, h:mm a')
    return <time {...props} dateTime={isoStyle} title={longStyle}>{formattedTime}</time>
  }
}

export default Time

function formatTimeFromNow (date) {
  return moment(date).fromNow()
}

export const TimeFromNow = (props) => (
  <Time {...props} format={formatTimeFromNow} />
)

function formatTimeAgo (date) {
  // Round future dates down to now
  return moment(Math.min(Date.now(), date.getTime())).fromNow()
}

export const TimeAgo = (props) => (
  <Time {...props} format={formatTimeAgo} />
)
