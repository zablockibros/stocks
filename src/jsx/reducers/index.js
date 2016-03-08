import { combineReducers } from 'redux'
import SearchReducer from './SearchReducer'
import TradeReducer from './TradeReducer'

const rootReducer = combineReducers({
  SearchReducer,
  TradeReducer
})

export default rootReducer
