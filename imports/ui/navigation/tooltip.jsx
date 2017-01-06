
import React from 'react'

/**
 * Styled tooltip that shows on hover
 * Built on top of ReBass tooltip
 */

const scale = 8
const fontSize = 12
const css = `
  .Tooltip_box { display: none }
  .Tooltip:hover .Tooltip_box { display: block }
`.replace(/\n/g, '').replace(/\s\s+/g, ' ')

const sx = {
  root: {
    position: 'relative',
    display: 'inline-block',
    cursor: 'pointer'
  },
  box: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    fontSize,
    whiteSpace: 'nowrap',
    paddingTop: scale / 2,
    paddingBottom: scale / 2,
    paddingLeft: scale,
    paddingRight: scale,
    color: '#fff',
    backgroundColor: '#25364b',
    borderRadius: '2px',
    transform: 'translate(-50%, -8px)'
  },
  arrow: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    border: '6px solid transparent',
    borderTopColor: '#25364B',
    transform: 'translate(-50%, 0)'
  }
}

const Tooltip = ({ title, children, ...props }) => {
  return (
    <span
      className='Tooltip'
      aria-label={title}
      style={sx.root}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div {...props}
        style={sx.box}
        className='Tooltip Tooltip_box'>
        {title}
        <div className='Tooltip_arrow' style={sx.arrow} />
      </div>
      {children}
    </span>
  )
}

Tooltip.propTypes = {
  /** Text to display in tooltip */
  title: React.PropTypes.string
}

export default Tooltip
