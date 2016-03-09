import { connect } from 'react-redux'
import { getStock } from '../actions'
import TradeList from '../components/TradeList'

const mapStateToProps = (state) => {
  return {
    stocks: state.TradeReducers.stocks.filter(t => { if(t.amt > 0) return true; else return false; })
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSelectStock: (symbol) => {
      dispatch(getStock(symbol))
    }
  }
}

const ActiveTradeList = connect(
  mapStateToProps,
  mapDispatchToProps
)(TradeList)

export default ActiveTradeList
