const stock = (state = {}, action) => {
  switch (action.type) {
    case 'INIT_STOCK':
      if(action.symbol == state.symbol){
        return {
          symbol : action.symbol,
          bid : action.bid,
          ask: action.ask,
          amt: 0
        }
      }
    case 'BUY_STOCK':
      if(action.symbol == state.symbol) {
        return {
          symbol: action.symbol,
          bid: action.bid,
          ask: action.ask,
          amt: action.amt + state.amt
        }
      }
    case 'SELL_STOCK':
      if(action.symbol == state.symbol) {
        return {
          symbol: action.symbol,
          bid: action.bid,
          ask: action.ask,
          amt: state.amt - action.amt
        }
      }
  }
}

const SearchReducers = (state = {money : 100000, stocks : []}, action) => {
  let stockIndex = state.stocks.reduce(t => (previousValue, currentValue, currentIndex, array) => { if(array[currentIndex].symbol == action.symbol) return currentIndex + 1; else return 0; }) - 1;
  switch (action.type) {
    case 'INIT_STOCK':
      if(stockIndex > -1){
        // Already exists in state
        return {
          money : state.money,
          stocks : [
            state.stocks.map(t => stock(t, action));
          ]
        }
      }
      else{
        return {
          money : state.money,
          stocks : [
            ...state.stocks,
            stock({symbol : action.symbol}, action)
          ]
        }
      }
    case 'BUY_STOCK':
      if(action.amt * state.stocks[stockIndex].ask >= state.money){
        return state.map(t => stock(t, action));
        return {
          money : state.money - action.amt * state.stocks[stockIndex].ask,
          stocks : [
            state.stocks.map(t => stock(t, action))
          ]
        }
      }
      else
        return state;
    case 'SELL_STOCK':
      if(action.amt <= state.stocks[stockIndex].amt){
        return {
          money : state.money + action.amt * state.stocks[stockIndex].bid,
          stocks : [
            state.stocks.map(t => stock(t, action))
          ]
        }
      }
      else
        return state;
    default:
      return state
  }
}

export default SearchReducers
