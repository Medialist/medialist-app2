
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
    cursor: 'pointer',
    zIndex: 1000
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
    borderRadius: '2px'
  },
  boxBottom: {
    bottom: 'inherit',
    top: '100%'
  },
  arrow: {
    position: 'absolute',
    top: '100%',
    border: '6px solid transparent',
    borderTopColor: '#25364B',
    transform: 'translate(-50%, 0)'
  },
  arrowBottom: {
    top: '-12px',
    borderTopColor: 'transparent',
    borderBottomColor: '#25364B'
  }
}

const Tooltip = ({ title, children, position = 'top', arrowPosition = '50%', ...props }) => {
  const yOffset = (position === 'top') ? '-8px' : '8px'
  const boxStyle = Object.assign({ transform: `translate(-${arrowPosition}, ${yOffset})` }, sx.box, position === 'bottom' ? sx.boxBottom : {})
  const arrowStyle = Object.assign({ left: arrowPosition }, sx.arrow, position === 'bottom' ? sx.arrowBottom : {})
  return (
    <span
      className='Tooltip'
      aria-label={title}
      style={sx.root}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div {...props}
        style={boxStyle}
        className='Tooltip Tooltip_box'>
        {title}
        <div className='Tooltip_arrow' style={arrowStyle} />
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
