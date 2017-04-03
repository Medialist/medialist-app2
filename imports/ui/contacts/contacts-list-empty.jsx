import React from 'react'
import { Link } from 'react-router'

export default () => (
  <section className='max-width-md mx-auto' style={{paddingTop: 150}} data-id='contacts-import'>
    <img className='align-top' src='/import.svg' width='316' height='210' />
    <div className='inline-block pl6'>
      <header>
        <div className='inline-block pr4'>
          <div className='semibold f-xxl'>Know your</div>
          <div style={{fontWeight: 900, fontSize: '36px'}}>CONTACTS</div>
        </div>
        <div className='inline-block border-left border-gray40 pl4'>
          Turn your contacts book into one of <br />
          your most valuable assets.
        </div>
      </header>
      <ul className='f-sm' style={{paddingLeft: 20, listStylePostition: 'inside', lineHeight: '30px'}}>
        <li>Unified point of record for all your team’s contacts</li>
        <li>Share contact need-to-knows and insight</li>
        <li>Know who is talking to to who</li>
        <li>Learn from every outcome, build stronger relationships</li>
      </ul>
      <div className='pt6'>
        <Link to='/contacts/import' className='btn bg-completed white' data-id='import-contacts-button'>
          Import contacts
        </Link>
      </div>
    </div>
  </section>
)
