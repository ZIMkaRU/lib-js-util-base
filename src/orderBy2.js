'use strict'

const get = require('./get')

const getValue = (obj, path) => {
  if (
    obj === undefined ||
    obj === null
  ) {
    return obj
  }
  if (typeof path !== 'string') {
    return obj?.[path]
  }

  return get(obj, path)
}

/**
 * Creates an array of elements, sorted in ascending or descending
 * order by the results of running each element in a collection
 * through each iteratee. Allows specifying the sort orders of
 * the iteratees to sort by. If `orders` is unspecified, all values
 * are sorted in ascending order. Otherwise, specify an order of
 * 'desc' for descending or 'asc' for ascending sort order of
 * corresponding values
 * @param {Array<T> | Iterable<T>} collection The collection to iterate over
 * @param {Array<string | number | Function>} iteratees The iteratees to sort by
 * @param {Array<'asc' | 'desc'>} [orders] The sort orders of `iteratees`
 * @returns {Array<T>} Returns the new sorted array
 */
module.exports = (collection, iteratees = [], orders = []) => {
  // It's able to consider iterable objects as well
  // If iterable object is required, just create it after ordering, not here
  const copiedColl = [...collection]

  if (
    copiedColl.length <= 1 ||
    iteratees.length === 0
  ) {
    return copiedColl
  }

  // Compile getters once
  const getters = new Array(iteratees.length)
  const directions = new Int8Array(iteratees.length)

  for (let i = 0; i < iteratees.length; i++) {
    const iteratee = iteratees[i]
    directions[i] = orders[i] === 'desc' ? -1 : 1
    const isIterateeFn = typeof iteratee === 'function'

    getters[i] = isIterateeFn
      ? iteratee
      : (obj) => getValue(obj, iteratee)
  }

  // Decorate
  const mapped = new Array(copiedColl.length)

  for (let i = 0; i < copiedColl.length; i++) {
    const value = copiedColl[i]
    const criteria = new Array(getters.length)

    for (let j = 0; j < getters.length; j++) {
      criteria[j] = getters[j](value)
    }

    mapped[i] = {
      value,
      index: i,
      criteria
    }
  }

  mapped.sort((a, b) => {
    for (let i = 0; i < a.criteria.length; i++) {
      const valA = a.criteria[i]
      const valB = b.criteria[i]

      if (valA === valB) {
        continue
      }

      if (
        valA === undefined ||
        valA === null
      ) {
        return 1
      }
      if (
        valB === undefined ||
        valB === null
      ) {
        return -1
      }

      if (valA > valB) {
        return directions[i]
      }
      if (valA < valB) {
        return -directions[i]
      }
    }

    return 0
  })

  // Undecorate
  for (let i = 0; i < mapped.length; i++) {
    copiedColl[i] = mapped[i].value
  }

  return copiedColl
}
