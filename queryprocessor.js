class QueryProcessorOld {
  constructor (root) {
    this.root = root
  }
  execute (query) {
    if (query) {
      const parent = this.execute (query.path)
      const args = query.args
      const name = query.name
      function selectMembers (obj, names) {
        const result = {}
        names.forEach (name => result [name] = obj [name])
        return result
      }
      function evalMember (obj, name, args) {
        const member = obj [name]
        if (typeof member === 'function') {
          return member.apply (obj, args || [])
        }
        else if (args) {
          if (Array.isArray (member)) {
            return member.map (m => selectMembers (m, args))
          }
          else {
            return selectMembers (member, args)
          }
        }
        return member
      }
      if (Array.isArray (parent)) {
        if (name === '$' && args) { // filter
          return parent.filter (p => !args.find (f => {
              for (const member in f) {
                if (p [member] != f [member]) return true
              }
            }))
        }
        else if (Number.isInteger (name) || !Number.isNaN (Number.parseInt (name))) {
          return evalMember (parent, name, args)
        }
        else {
          return parent.map (p => evalMember (p, name, args))
        }
      }
      else {
        return evalMember (parent, name, args)
      }
    }
    return this.root
  }
}

const QUERY_OBJECT = Symbol();
const QUERY_FIELD = Symbol();
const FIELD_OBJECT = Symbol();
const RESPONSE_OBJECT = Symbol();

class QueryObject {
  constructor (obj) {
    this [QUERY_OBJECT] = obj
  }
  get name () {return this [QUERY_FIELD]}
  processQuery (query, index) {
    if (index < query.length) {
      const command = query [index++]
      const object = this [QUERY_OBJECT]
      if (object) {
        if (Array.isArray (command)) { // function call
          if (typeof object === 'function') {
            this [QUERY_OBJECT] = object.apply (null, command)
            return processQuery (result, query, index)
          }
          else {
            return applyFilterAndSelector (result, command, query, index) 
          }
        }
        else { // property
          let idx = Number.parseInt (command)
          if (!Number.isNaN (idx) && Array.isArray (object)) {
            result [QUERY_OBJECT] = object [idx]
            return processQuery (result, query, index)
          }
          if (Array.isArray (object)) {
            result [command] = object.map (item => processProperty (item, command, query, index))
          }
          else {
            result [command] = processProperty (object, command, query, index)
          }
        }
      }
    }
    return this
  }
  toJSON () {
    const obj = this [QUERY_OBJECT]
    if (obj) {
      if (!Array.isArray (obj)) {
        return Object.assign ({}, this, ('toJSON' in obj) ? obj.toJSON () : obj)
      }
    }
    return obj
  }
}

function createQueryObject (obj) {
  return new QueryObject (obj)
}

function applyFilterAndSelector (result, args, query, index) {
  const {filter, selector} = args.reduce ((acc, arg) => {
    if (typeof arg === 'object')
      acc.filter.push (arg)
    else
      acc.selector.push (arg)
    return acc})

  function applyFilter (obj) {
    const object = obj [QUERY_OBJECT]
    return filter.length === 0 || filter.find (arg => !Object.keys (arg).find (name => object [name] != arg [name]))
  }
  function applySelector (obj) {
    const object = obj [QUERY_OBJECT]
    selector.forEach (name => obj [name] = object [name])
  }
  const object = result [QUERY_OBJECT]
}

function processProperty (object, property, query, index) {
  let value = object [property]
  if (typeof value === 'function') {
    const funcValue = value
    value = function () {return funcValue.apply (object, Array.from (arguments))}
  }
  return processQuery (createQueryObject (value), query, index)
}

function processQuery (result, query, index) {
  if (index < query.length) {
    const command = query [index++]
    const object = result [QUERY_OBJECT]
    if (object) {
      if (Array.isArray (command)) { // function call
        if (typeof object === 'function') {
          result [QUERY_OBJECT] = object.apply (null, command)
          return processQuery (result, query, index)
        }
        else {
          return applyFilterAndSelector (result, command, query, index) 
        }
      }
      else { // property
        if (!Number.isNaN (Number.parseInt (command)) && Array.isArray (object)) {
          result [QUERY_OBJECT] = object [command]
          return processQuery (result, query, index)
        }
        if (Array.isArray (object)) {
          result [command] = object.map (item => processProperty (item, command, query, index))
        }
        else {
          result [command] = processProperty (object, command, query, index)
        }
      }
    }
  }
  return result
}

class QueryProcessor {
  constructor (root) {
    this.root = root
  }
  execute (query) {
    return processQuery (createQueryObject (this.root), query, 0)
  }
}

module.exports = function (root) {return new QueryProcessor (root)}