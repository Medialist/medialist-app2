import React from 'react'
import Base from 'rebass/dist/Base'
import config from 'rebass/dist/config'

const DropdownMenu = ({
  open,
  right,
  top,
  children,
  onDismiss,
  arrowPosition, // either a valid CSS distance for the "right" property of the arrow, or false for no arrow
  ...props
}) => {
  const { zIndex, scale, borderColor, borderRadius, colors } = { ...config }

  const sx = {
    root: {
      display: open ? null : 'none',
      position: 'absolute',
      left: right ? 'auto' : 0,
      right: right ? 0 : 'auto',
      top: top ? 'auto' : '100%',
      bottom: top ? '100%' : 'auto',
      zIndex: 4
    },
    overlay: {
      position: 'fixed',
      display: open ? null : 'none',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    content: {
      position: 'relative',
      top: '2px',
      zIndex: zIndex[1]
    }
  }

  const arrowStyle = {
    display: 'inline-block',
    position: 'absolute',
    top: '-7px',
    left: arrowPosition || 'calc(50% - 10px)',
    width: '0',
    height: '0',
    border: '8px solid transparent',
    borderBottomColor: 'white',
    borderTop: '0 none',
    borderRadius: '2px'
  }

  return (
    <Base
      {...props}
      className='DropdownMenu'
      baseStyle={sx.root}>
      <div style={sx.overlay}
        onClick={onDismiss} />
      <div style={sx.content}>
        {arrowPosition === false ? null : <div style={arrowStyle} />}
        <Base
          {...props}
          className='Menu'
          children={children}
          baseStyle={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: 128,
            marginBottom: scale[2],
            overflow: 'hidden',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor,
            borderRadius,
            color: colors.black,
            backgroundColor: colors.white
          }} />
      </div>
    </Base>
  )
}

DropdownMenu.propTypes = {
  /** Toggles visibility of DropdownMenu */
  open: React.PropTypes.bool,
  /** Anchors menu to the right */
  right: React.PropTypes.bool,
  /** Anchors menu to the top */
  top: React.PropTypes.bool,
  /** Click event callback for the background overlay */
  onDismiss: React.PropTypes.func
}

DropdownMenu.defaultProps = {
  open: false,
  onDismiss: function () {}
}

DropdownMenu.contextTypes = {
  rebass: React.PropTypes.object
}

export default DropdownMenu
