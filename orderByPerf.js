'use strict'

/* eslint-env mocha */

const assert = require('assert')
const orderBy = require('./src/orderBy2')
const _ = require('lodash')

const DATA1 = Array.from({ length: 10_000_000 }, (_, i) => ({
  id: i,
  value: Math.floor(Math.random() * 1000)
}))
const DATA2 = _.cloneDeep(DATA1)

describe.only('iteratee calls', () => {
  it('lodash evaluates each element only once', () => {
    let lodashCalls = 0

    _.orderBy(DATA1, [
      item => {
        lodashCalls++
        return item.value
      }
    ])

    assert.deepStrictEqual(lodashCalls, DATA1.length)
  })

  it('custom implementation evaluates elements same times than lodash', () => {
    let customCalls = 0

    orderBy(DATA2, [
      item => {
        customCalls++
        return item.value
      }
    ])

    assert.deepStrictEqual(customCalls, DATA2.length)
  })
})
