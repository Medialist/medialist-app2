import React, { PropTypes } from 'react'
import Menu from './menu'

const EditableAvatarWithButtons = React.createClass({
  propTypes: {
    avatar: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired
  },

  onImageChange (e) {
    this.props.onChange(e)
  },

  onImageError (err) {
    this.props.onError(err)
  },

  render () {
    return (
      <div style={this.props.style}>
        {this.props.children}
        <Menu
          avatar={this.props.avatar}
          onChange={this.onImageChange}
          onError={this.onImageError} />
      </div>
    )
  }
})

export default EditableAvatarWithButtons
