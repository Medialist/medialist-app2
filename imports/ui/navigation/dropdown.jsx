import React, { PropTypes } from 'react'

/*
 * Dropdown & DropdownMenu
 *
 * Usage:
 *   <Dropdown>
 *     <button onClick={() => this.setState({open: true})}>Fire!</button>
 *     <DropdownMenu width={200}>
 *      <div>Option 1</div>
 *      <div>Option 2</div>
 *     </DropdownMenu>
 *   </Dropdown>
 */

export const Dropdown = ({children}) => (
  <div style={{display: 'inline-block'}}>
    {children}
  </div>
)

// Invisible click grabber, to detect when the user clicks away.
const Overlay = ({onClick}) => {
  return (
    <div onClick={onClick} style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0}} />
  )
}

// `open` is used to show and hide the menu
// `top` is used to move the menu and arrow down.
const Container = ({open, top = 0, children}) => (
  <div style={{
    display: open ? null : 'none',
    position: 'relative',
    top
  }}>
    {children}
  </div>
)

// An arrow tip that appears at the top middle of the dropdown menu
const MenuArrow = ({size = 10}) => (
  <div style={{
    zIndex: 600,
    position: 'absolute',
    top: `-${size}px`,
    left: `calc(50% - ${size}px)`,
    width: '0',
    height: '0',
    border: `${size}px solid transparent`,
    borderBottomColor: 'white',
    borderTop: '0 none',
    borderRadius: '2px'
  }} />
)

// `width` forces the width of the Menu.
//         width is required to make other calculaitons possible.
// `left` is the pixels from the left edge of the trigger element...
//        centered by default.
//        `left={0}` would make the left of the menu inline with the left of the
//         trigger element.
const MenuPosition = ({width, left = `calc(50% - ${width / 2}px)`, children}) => (
  <div style={{
    position: 'absolute',
    width: `${width}px`,
    left
  }}>
    {children}
  </div>
)

// Styling for the dropdown box and shadow, and reset positon to relative.
const Menu = ({children}) => (
  <div style={{
    position: 'relative',
    zIndex: 500,
    background: 'white',
    boxShadow: '0px 1px 10px 0px rgba(0,0,0,0.20)'
  }}>
    {children}
  </div>
)

export const DropdownMenu = ({open, width, left, top = 0, arrowSize = 10, onDismiss, children}) => {
  return (
    <Container open={open} top={top + arrowSize}>
      <Overlay onClick={onDismiss} />
      <MenuArrow size={arrowSize} />
      <MenuPosition width={width} left={left}>
        <Menu>
          {children}
        </Menu>
      </MenuPosition>
    </Container>
  )
}

DropdownMenu.propTypes = {
  open: PropTypes.bool.isRequired,
  width: PropTypes.number.isRequired,
  left: PropTypes.number,
  top: PropTypes.number,
  arrowSize: PropTypes.number,
  onDismiss: PropTypes.func,
  children: PropTypes.node
}
