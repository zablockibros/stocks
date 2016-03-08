import {combineReducers} from 'redux';
import SearchReducer from './SearchReducer'
import TradeReducers from './TradeReducer'
import ErrorReducer from './ErrorReducer'

const rootReducer = combineReducers({
  SearchReducer,
  TradeReducers,
  ErrorReducer
})

export default rootReducer
