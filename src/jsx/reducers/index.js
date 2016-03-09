import {combineReducers} from 'redux';
import SearchReducer from './SearchReducer'
import TradeReducers from './TradeReducer'
import ErrorReducers from './ErrorReducer'

const rootReducer = combineReducers({
  SearchReducer,
  TradeReducers,
  ErrorReducers
})

export default rootReducer
