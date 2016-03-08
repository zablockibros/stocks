import React from 'react'
import { connect } from 'react-redux'
import { buyStock } from '../actions'

let input;

let  BuyStock = ({dispatch}) => (
  <form onSubmit={e => {
        e.preventDefault();
        if (!input.value.trim()) {
          return
        }
        dispatch(buyStock(input.value))
      }}>
    <input ref={node => {
          input = node
        }} type="number"/>
    <button type="submit">
      Search stock
    </button>
  </form>
);

BuyStock = connect()(BuyStock);

export default BuyStock
