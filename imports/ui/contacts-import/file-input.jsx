var React = require('react')

/*
 Create a hidden file input, and simulate a click on it when parent element is
 clicked.

 Pass in a button or any children you want to see on the page.
*/
const FileInput = React.createClass({
  onClick () {
    this.fileInput.click()
  },

  render () {
    const { className, disabled, accept, onChange } = this.props
    return (
      <div className={className} style={{position: 'relative', overflow: 'hidden'}} onClick={this.onClick}>
        <input
          ref={(r) => { this.fileInput = r }}
          type='file'
          accept={accept}
          disabled={disabled}
          onChange={onChange}
          style={{visibility: 'none', position: 'absolute', top: '-9999px'}}
          id='file-input'
          />

        { this.props.children }
      </div>
    )
  }
})

export default FileInput
