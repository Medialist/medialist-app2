import React from 'react'
import { Meteor } from 'meteor/meteor'
import Topbar from '../navigation/topbar'
import CsvToContacts from './csv-to-contacts'
import ImportTable from './contacts-import-table'

export default React.createClass({
  getInitialState () {
    const { state } = this.props.location
    console.log('state', state)
    if (!state) {
      return {
        rows: [],
        cols: []
      }
    }
    return state
  },

  onColumnChange (newCol, i) {
    console.log('onColumnChange', newCol, i)
    const cols = Array.from(this.state.cols)
    cols[i] = newCol
    this.setState({cols})
  },

  onSave () {
    const { cols, rows } = this.state
    // go to 3
  },

  render () {
    const { onColumnChange, onSave } = this
    const { cols, rows } = this.state
    return (
      <div>
        <Topbar backLinkText='Cancel'>
          <button className='btn bg-completed white mx4' onClick={onSave}>
            Save and import contacts
          </button>
        </Topbar>
        <ContactImportPreview rows={rows} cols={cols} onColumnChange={onColumnChange} />
      </div>
    )
  }
})

const ContactImportPreview = ({rows, cols, onColumnChange}) => (
  <section className='block'>
    <div className='my6 center pt6'>
      <h2 className='normal mt6'>Match your spreadsheet fields to Medialist fields</h2>
      <h3 className='normal'>Below is a preview of your spreadsheet. Match the columns to Medialist fields.</h3>
      <div className='inline-block bg-white mt3 border border-gray80'>
        <div className='inline-block border-right border-gray80 py3 px6'>
          <span className='blue mr1'>{rows.length}</span>Contacts found
        </div>
        <div className='inline-block py3 px6'>
          <span className='blue mr1'>{cols.filter((c) => !!c).length}</span>Columns selected
        </div>
      </div>
    </div>
    <div className='mt6 px3'>
      <ImportTable cols={cols} rows={rows} onColumnChange={onColumnChange} />
    </div>
  </section>
)
