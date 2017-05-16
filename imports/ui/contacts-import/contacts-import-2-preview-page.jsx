import React from 'react'
import { withRouter } from 'react-router'
import Topbar from '/imports/ui/navigation/topbar'
import ImportTable from '/imports/ui/contacts-import/contacts-import-table'

export default withRouter(React.createClass({
  getInitialState () {
    const { state } = this.props.location
    return Object.assign({
      rows: [],
      cols: []
    }, state)
  },

  onColumnChange (newCol, i) {
    const cols = Array.from(this.state.cols)
    cols[i] = newCol
    this.setState({cols})
  },

  onSave () {
    const { cols, rows } = this.state
    const { router } = this.props
    router.push({
      pathname: '/contacts/import/processing',
      state: {cols, rows}
    })
  },

  render () {
    const { onColumnChange, onSave } = this
    const { cols, rows } = this.state
    return (
      <div>
        <Topbar backLinkText='Cancel'>
          <button className='btn bg-completed white mx4' onClick={onSave} data-id='save-and-import-contacts-button'>
            Save and import contacts
          </button>
        </Topbar>
        <ContactImportPreview rows={rows} cols={cols} onColumnChange={onColumnChange} />
      </div>
    )
  }
}))

const PREVIEW_ROW_COUNT = 26

const ContactImportPreview = ({rows, cols, onColumnChange}) => (
  <section className='block'>
    <div className='center py4'>
      <h1 className='f-xxl gray10 my1 semibold'>Match your spreadsheet fields to Medialist fields</h1>
      <p className='f-lg gray20 my3'>Below is a preview of your spreadsheet. Match the columns to Medialist fields.</p>
      <div className='inline-block bg-white mt3 px1 py2 border border-gray80'>
        <div className='inline-block border-right border-gray80 semibold f-sm py1 px3'>
          <span className='blue mr1'>{rows.length}</span>Contacts found
        </div>
        <div className='inline-block py1 px3 semibold f-sm'>
          <span className='blue mr1'>{cols.filter((c) => !!c).length}</span>Columns selected
        </div>
      </div>
    </div>
    <div className='mt6 px3'>
      <ImportTable cols={cols} rows={rows.slice(0, PREVIEW_ROW_COUNT)} onColumnChange={onColumnChange} />
    </div>
  </section>
)
