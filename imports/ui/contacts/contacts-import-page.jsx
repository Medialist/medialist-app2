import React from 'react'
import Topbar from '../navigation/topbar'
import FilePicker from 'react-file-input'

export default React.createClass({
  onChange (evt) {
    console.log(evt.target.files[0])
  },
  render () {
    const style = {
      borderStyle: 'dashed',
      borderWidth: '4px'
    }
    return (
      <div>
        <Topbar backLinkText='cancel' />
        <section className='mx-auto center py6' style={{width: `${window.innerWidth / 1.7}px`}}>
          <h1 className='mt6'>Import your contacts</h1>
          <h2 className='normal'>Select a CSV file or Excel spreadsheet below</h2>
          <div className='border-gray80 bg-white mx-auto py6 width-100' style={style}>
            <h3 className='my4 normal'>Drag and drop your file here</h3>
            <h3 className='my2'>OR</h3>
            <button className='bg-blue white mt2 mb4 px4 py2 border-transparent normal rounded center relative' style={{width: '15rem'}}>
              <span>Select a file from your computer...</span>
              <span className='absolute top-0 left-0 width-100'>
                <FilePicker name='contacts-upload' accept='text/csv' onChange={this.onChange} className='pb4' />
              </span>
            </button>
          </div>
          <h4 className='normal' style={{lineHeight: '2rem'}}>Importing a CSV file or Excel spreadsheet allows you to add and update contacts stored in Medialist. If a contact email address or Twitter handle in your spreadsheet matches an existing contact, the contact will be updated with the mapped values from your spreadsheet. Otherwise, a new contact will be created.</h4>
        </section>
      </div>
    )
  }
})
