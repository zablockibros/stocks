import React from 'react'
import { connect } from 'react-redux'
import { getStock } from '../actions'

let input;

let  SearchStock = ({dispatch}) => (
        <form onSubmit={e => {
        e.preventDefault();
        if (!input.value.trim()) {
          return
        }
        dispatch(getStock(input.value))
      }}>
          <input ref={node => {
          input = node
        }} type="text"/>
          <button type="submit">
            Search stock
          </button>
        </form>
    );

SearchStock = connect()(SearchStock);

export default SearchStock
