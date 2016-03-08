import React from 'react'
import { connect } from 'react-redux'
import { sellStock } from '../actions'

let input;

let  SearchStock = ({dispatch}) => (
  <form onSubmit={e => {
        e.preventDefault();
        if (!input.value.trim()) {
          return
        }
        else if(+input.value < 1){
          return
        }
        dispatch(sellStock(input.value))
      }}>
    <input ref={node => {
          input = node
        }} type="number"/>
    <button type="submit">
      Search stock
    </button>
  </form>
);

SearchStock = connect()(SearchStock);

export default SearchStock
