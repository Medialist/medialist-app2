import assert from 'assert'
import { create } from './methods'
import MasterLists from './master-lists'
import { resetDatabase } from 'meteor/xolvio:cleaner';

describe('master-lists', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should fail if type or name is missing', function () {
    assert.throws(() => {
      create.validate({ name: 'Hello' })
    })
    assert.throws(() => {
      create.validate({ type: 'Contacts' })
    })
  })

  it('should fail if type is invalid', function () {
    assert.throws(() => {
      create.validate({ name: 'Hello', type: 'Dogs' })
    })
  })

  it('should fail if type is invalid', function () {
    assert.throws(() => {
      create.validate({ name: 'Hello', type: 'Dogs' })
    })
  })

  it('should succeed if name and type are valid', function () {
    assert.doesNotThrow(() => {
      create.validate({ name: 'Hello', type: 'Contacts' })
    })
  })

  it('If all is well it should create a new master-list', function () {
    const id = create.run.call(
      { userId: '123' },
      { name: 'Hello', type: 'Contacts' }
    )
    assert.ok(id)
    const list = MasterLists.findOne(id)
    assert.equal(list.slug, 'hello')
    assert.equal(list.name, 'Hello')
    assert.equal(list.type, 'Contacts')
    assert.equal(list.order, 0)
  })
})
