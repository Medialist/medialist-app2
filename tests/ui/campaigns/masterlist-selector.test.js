import test from 'ava'
import React from 'react'
import { shallow } from 'enzyme'

import MasterListsSelector from '../../../imports/ui/campaigns/masterlists-selector'

test('should render without exploding', (t) => {
  t.plan(1)
  const items = [
    { _id: 0, name: 'All', items: [{}, {}, {}] },
    { _id: 1, name: 'My campaigns', items: [] }
  ]
  const wrapper = shallow(<MasterListsSelector type='Campaigns' items={items} selected={items[0]} onSectorChange={() => {}} />)
  t.is(wrapper.length, 1)
})
