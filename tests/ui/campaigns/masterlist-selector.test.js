import test from 'ava'
import React from 'react'
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15'
import MasterListsSelector from '../../../imports/ui/campaigns/masterlists-selector'

Enzyme.configure({ adapter: new Adapter() })

test.before(t => {
	global.window = { addEventListener () {} }
})

test.after(t => {
	delete global.window
})

test('should render without exploding', (t) => {
  t.plan(1)
  const items = [
    { _id: 0, name: 'All', items: [{}, {}, {}], slug: 'all' },
    { _id: 1, name: 'My campaigns', items: [], slug: 'my' }
  ]
  const wrapper = shallow(<MasterListsSelector type='Campaigns' items={items} selected={items[0]} onChange={() => {}} />)
  t.is(wrapper.length, 1)
})
