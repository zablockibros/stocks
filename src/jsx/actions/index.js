import fetch from 'isomorphic-fetch'

// Lazy array to update all of the stocks and their stats
let updateIntervals = {};

export const REQUEST_STOCK = 'REQUEST_STOCK'
export function requestStock(symbol) {
  return {
    type: 'REQUEST_STOCK',
    symbol
  }
}

export const RECEIVE_STOCK = 'RECIEVE_STOCK'
export function receiveStock(symbol, json) {
  return {
    type: RECEIVE_STOCK,
    symbol,
    bid: json.data[symbol].bidPrice,
    ask: json.data[symbol].askPrice
  }
}

export const INVALID_SYMBOL = 'INVALID_SYMBOL'

export function invalidSymbol(symbol) {
  return {
    type: INVALID_SYMBOL,
    symbol
  }
}

export const BAD_SYMBOL = 'BAD_SYMBOL'

export function badSymbol(message) {
  return {
    type: BAD_SYMBOL,
    message
  }
}

export function getStock(symbol, update = false) {
  return function (dispatch) {

    dispatch(requestStock(symbol))

    return fetch(`http://careers-data.benzinga.com/rest/richquote?symbols=${symbol}`)
      .then(function(response){
        if (response.status >= 400 && !update) {
          dispatch(invalidSymbol(symbol));
          throw new Error("Bad response");
        }
        return response.json()
      })
      .then(json => {
        if(json[symbol].error  && !update){
          dispatch(badSymbol(json[symbol].error.message))
        }
        else if(!update) {
          dispatch(recieveStock(symbol, json))
          dispatch(initStock(symbol, json))
        }
        else{
          // Purely to constantly update prices for you
          dispatch(updateStock(symbol, json))
        }
      })
  }
}

export const INIT_STOCK = 'INIT_STOCK'

function initStock(symbol, json) {
  if(!updateIntervals[symbol]){
    dispatch(getStock(symbol, true));
  }
  return {
    type: INIT_STOCK,
    symbol,
    bid: json.data[symbol].bidPrice,
    ask: json.data[symbol].askPrice
  }
}

export const UPDATE_STOCK = 'UPDATE_STOCK'

function updateStock(symbol, json) {
    if(!updateIntervals[symbol]){
      updateIntervals[symbol] = setInterval(() => dispatch(getStock(symbol, true)), 2500)
   }
  return {
    type: UPDATE_STOCK,
    symbol,
    bid: json.data[symbol].bidPrice,
    ask: json.data[symbol].askPrice
  }
}

export const BUY_STOCK = 'BUY_STOCK'

export function buyStock(symbol, amt) {
  return {
    type: BUY_STOCK,
    symbol,
    amt
  }
}


export const SELL_STOCK = 'SELL_STOCK'

export function sellStock(symbol, amt) {
  return {
    type: SELL_STOCK,
    symbol,
    amt
  }
}

export const SELL_STOCK_FAIL = 'SELL_STOCK_FAIL'

export function sellStockFail(symbol, amt) {
  return {
    type: SELL_STOCK_FAIL,
    message : `You don't have ${amt} shares of ${symbol}`
  }
}

export const BUY_STOCK_FAIL = 'BUY_STOCK_FAIL'

export function buyStockFail(symbol, amt) {
  return {
    type: BUY_STOCK_FAIL,
    message : `You don't have enought money to buy ${amt} shares of ${symbol}`
  }
}
