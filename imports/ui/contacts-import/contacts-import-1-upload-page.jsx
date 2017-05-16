import React from 'react'
import { withRouter } from 'react-router'
import FileInput from '/imports/ui/contacts-import/file-input'
import Topbar from '/imports/ui/navigation/topbar'
import CsvToContacts from '/imports/ui/contacts-import/csv-to-contacts'

export default withRouter(React.createClass({
  getInitialState () {
    return { file: null }
  },

  onFileChange (evt) {
    const file = evt.target.files[0]
    this.setState({file})
  },

  onImport () {
    const { router } = this.props
    const { file } = this.state
    CsvToContacts.importCsvFile(file, (err, data) => {
      if (err) return console.error(err)
      router.push({
        pathname: '/contacts/import/preview',
        state: data
      })
    })
  },

  render () {
    const { onFileChange, onImport } = this
    const { file } = this.state
    return (
      <div data-id='contacts-import'>
        <Topbar backLinkText='Cancel' />
        <section className='mx-auto center py3' style={{maxWidth: 554}}>
          <h1 className='f-xxl gray10 m0 pb2 semibold'>Import your contacts</h1>
          <p className='f-lg gray20 m0 pb5'>Select a CSV file or Excel spreadsheet</p>
          { file ? (
            <FileInfo onFileChange={onFileChange} onImport={onImport} file={file} />
          ) : (
            <UploadFile onFileChange={onFileChange} />
          )}
          <p className='normal p2' style={{lineHeight: '1.8rem'}}>
            Importing a CSV file or Excel spreadsheet allows you to add and update contacts stored in Medialist. If a contact email address or Twitter handle in your spreadsheet matches an existing contact, the contact will be updated with the mapped values from your spreadsheet. Otherwise, a new contact will be created.
          </p>
        </section>
      </div>
    )
  }
}))

const UploadFile = ({ onFileChange }) => (
  <div className='rounded border-gray60 bg-white py2 mx-auto width-100' style={{ borderStyle: 'dashed', borderWidth: '2px' }}>
    <h3 className='py4 m0 normal'>Drag and drop your file here</h3>
    <div className='semibold gray10'>OR</div>
    <div className='pt4 pb6'>
      <FileInput name='contacts-upload' accept='text/csv' onChange={onFileChange}>
        <div className='btn bg-blue white mx4'>
          Select a file from your computer...
        </div>
      </FileInput>
    </div>
  </div>
)

const FileInfo = ({ file, onImport, onFileChange }) => (
  <div className='rounded border-gray60 bg-white mx-auto width-100' style={{ borderStyle: 'dashed', borderWidth: '2px' }}>
    <div className='py6'>
      <div className='inline-block mr3 align-middle rounded bg-gray10 white caps semibold f-lg' style={{width: 53, padding: '15px 0'}}>
      CSV
      </div>
      <div className='inline-block align-middle left-align'>
        <div className='italic gray20 f-lg semibold'>{file.name}</div>
        <div className='gray20 f-lg'>{(file.size * 0.001).toFixed(1)} KB</div>
        <FileInput accept='text/csv' onChange={onFileChange}>
          <div className='pointer blue f-sm underline'>Change</div>
        </FileInput>
      </div>
    </div>
    <div className='py4 center border-top border-gray80'>
      <button className='btn bg-completed white mx4' onClick={onImport} data-id='upload-contacts-button'>
        Upload File
      </button>
    </div>
  </div>
)
