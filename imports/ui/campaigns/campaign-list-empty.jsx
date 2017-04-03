import React from 'react'

export default ({ onAddCampaign }) => (
  <section className='max-width-md mx-auto' style={{paddingTop: 150}}>
    <img className='align-top' src='/import.svg' width='316' height='210' />
    <div className='inline-block pl6'>
      <header>
        <div className='inline-block pr4'>
          <div className='semibold f-xxl'>Manage your</div>
          <div style={{fontWeight: 900, fontSize: '36px'}}>CAMPAIGNS</div>
        </div>
        <div className='inline-block border-left border-gray40 pl4'>
          Keep campaign teams working <br />
          in-sync
        </div>
      </header>
      <ul className='f-sm' style={{paddingLeft: 20, listStylePostition: 'inside', lineHeight: '30px'}}>
        <li>Track campaign progress in realtime</li>
        <li>All your coverage and content feedback in one place</li>
        <li>Work better, together</li>
      </ul>
      <div className='pt3'>
        <button onClick={onAddCampaign} className='btn bg-completed white' data-id='create-campaign-button'>
          Create Campaign
        </button>
      </div>
    </div>
  </section>
)
