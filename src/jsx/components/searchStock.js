import React from 'react'
import { connect } from 'react-redux'
import { selectStock } from '../actions'

let searchStock = ({ dispatch }) => {
  let input

  return (
    <div>
      <form onSubmit={e => {
        e.preventDefault()
        if (!input.value.trim()) {
          return
        }
        dispatch(getStock(input.value))
      }}>
        <input ref={node => {
          input = node
        }} type="number" />
        <button type="submit">
          Search stock
        </button>
      </form>
    </div>
  )
}
searchStock = connect()(searchStock)

export default searchStock
