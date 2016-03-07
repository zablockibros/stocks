import fetch from 'isomorphic-fetch'

export const REQUEST_STOCK = 'REQUEST_STOCK'
function requestStock(symbol) {
  return {
    type: 'REQUEST_STOCK',
    symbol
  }
}

export const RECEIVE_STOCK = 'RECIEVE_STOCK'
function receiveStock(symbol, json) {
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

export function getStock(symbol) {

  return function (dispatch) {

    dispatch(requestStock(symbol))

    return fetch(`http://careers-data.benzinga.com/rest/richquote?symbols=${symbol}`)
      .then(function(response){
        if (response.status >= 400) {
          dispatch(invalidSymbol(symbol));
          throw new Error("Bad response");
        }
        return response.json()
      })
      .then(json => {
        if(json[symbol].error){
          dispatch(badSymbol(json[symbol].error.message))
        }
        else {
          dispatch(recieveStock(symbol, json))
          //dispatch(initStock(symbol, json))
        }
      })
  }
}

export const INIT_STOCK = 'INIT_STOCK'

function initStock(symbol, json) {
  return {
    type: INIT_STOCK,
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
