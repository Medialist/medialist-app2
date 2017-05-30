import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

/*
 Drop files on me.
*/
class FileDrop extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    dropClassName: PropTypes.string,
    dropStyle: PropTypes.object,
    onFiles: PropTypes.func.isRequired
  }

  state = { dragOver: false }

  onDrop = (evt) => {
    evt.preventDefault()
    evt.stopPropagation()
    const dataTransfer = evt.nativeEvent.dataTransfer
    const files = dataTransfer && dataTransfer.files
    this.setState({dragOver: false})
    if (!files) return
    this.props.onFiles(files)
  }

  onDragOver = (evt) => {
    // Voodoo to make onDrop work...
    evt.preventDefault()
    evt.stopPropagation()
    return false
  }

  onDragEnter = (evt) => {
    evt.preventDefault()
    const {target} = evt
    this.setState({dragOver: target})
  }

  onDragLeave = (evt) => {
    evt.preventDefault()
    const {target} = evt
    // ignore dragleave from child nodes
    if (target !== this.state.dragOver) return
    this.setState({dragOver: false})
  }

  render () {
    const { className, style, dropStyle, dropClassName } = this.props
    const s = Object.assign(
      style,
      this.state.dragOver ? dropStyle : null
    )
    const cn = classnames(className, this.state.dragOver ? dropClassName : '')
    return (
      <div
        style={s}
        className={cn}
        onDrop={this.onDrop}
        onDragOver={this.onDragOver}
        onDragEnter={this.onDragEnter}
        onDragLeave={this.onDragLeave}
      >
        { this.props.children }
      </div>
    )
  }
}

export default FileDrop
