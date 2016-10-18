import React from 'react'

const toClassName = (status) => status.toLowerCase().replace(' ', '-')
const style = { borderRadius: 10, verticalAlign: 2, letterSpacing: 1 }

export default (props) => {
  const { status } = props
  const className = `inline-block mx2 px2 py1 f-xxxxs bold uppercase white bg-${toClassName(status)}`
  return <span style={style} className={className}>{props.status}</span>
}

export { toClassName }
