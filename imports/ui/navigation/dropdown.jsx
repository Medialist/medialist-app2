import React, { PropTypes } from 'react'

/*
 * Dropdown & DropdownMenu
 *
 * Usage:
 *   <Dropdown>
 *     <button onClick={() => this.setState({open: true})}>Fire!</button>
 *     <DropdownMenu width={200} open={this.state.open}>
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
const MenuArrow = ({height}) => {
  const side = Math.sqrt(2) * height
  return (
    <div style={{
      zIndex: 600,
      position: 'absolute',
      width: '100%',
      height: `${height}px`,
      top: `-${height}px`,
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'inline-block',
        position: 'relative',
        left: `calc(50% - ${side / 2}px)`,
        width: `${side}px`,
        height: `${side}px`,
        transform: `translate(0, ${height / 2}px) rotate(45deg)`,
        borderRadius: '2px 0 0 0',
        background: 'white',
        boxShadow: '0px 1px 10px 0px rgba(0,0,0,0.20)'
      }} />
    </div>
  )
}

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

export const DropdownMenu = ({open, width, left, top = 0, arrowHeight = 12, onDismiss, children}) => {
  return (
    <Container open={open} top={top + arrowHeight}>
      <Overlay onClick={onDismiss} />
      <MenuArrow height={arrowHeight} />
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
  arrowHeight: PropTypes.number,
  onDismiss: PropTypes.func,
  children: PropTypes.node
}
