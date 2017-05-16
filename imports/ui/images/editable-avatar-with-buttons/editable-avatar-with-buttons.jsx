import React from 'react'
import PropTypes from 'prop-types'
import Menu from '/imports/ui/images/editable-avatar-with-buttons/menu'

const EditableAvatarWithButtons = React.createClass({
  propTypes: {
    avatar: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    name: PropTypes.string
  },

  render () {
    return (
      <div style={this.props.style}>
        {this.props.children}
        <Menu
          name={this.props.name}
          avatar={this.props.avatar}
          onChange={this.props.onChange}
          onError={this.props.onError} />
      </div>
    )
  }
})

export default EditableAvatarWithButtons
