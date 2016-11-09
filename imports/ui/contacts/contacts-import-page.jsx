import React from 'react'
import Topbar from '../navigation/topbar'

export default React.createClass({
  render () {
    const style = {
      borderStyle: 'dashed',
      borderWidth: '4px'
    }
    return (
      <div>
        <Topbar backLinkText='cancel' />
        <section className='mx-auto center py6' style={{width: `${window.innerWidth / 2}px`}}>
          <h1 className='mt6'>Import your contacts</h1>
          <h2 className='normal'>Select a CSV file or Excel spreadsheet below</h2>
          <div className='border-gray80 bg-white mx-auto py6 width-100' style={style}>
            <h3 className='pt2 normal'>Drag and drop your file here</h3>
            <h3 className='pt2'>OR</h3>
            <button className='btn bg-blue white pt2 mb4'>Select a file from your computer...</button>
          </div>
          <h4 className='normal' style={{lineHeight: '2rem'}}>Importing a CSV file or Excel spreadsheet allows you to add and update contacts stored in Medialist. If a contact email address or Twitter handle in your spreadsheet matches an existing contact, the contact will be updated with the mapped values from your spreadsheet. Otherwise, a new contact will be created.</h4>
        </section>
      </div>
    )
  }
})
