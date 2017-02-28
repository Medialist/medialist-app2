import React from 'react'

const toClassName = (status) => status.toLowerCase().replace(' ', '-')
const style = {
  borderRadius: 10,
  verticalAlign: 2,
  fontWeight: 800,
  padding: '3px 10px'
}

export default (props) => {
  const { status } = props
  const className = `inline-block mx2 f-xxxxs uppercase white bg-${toClassName(status)}`
  return <span style={style} className={className}>{props.status}</span>
}

export { toClassName }
