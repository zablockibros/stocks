const ErrorReducers = (state = { message : null }, action) => {
  switch (action.type) {
    case 'BUY_STOCK_FAIL':
      return {
        message: action.message
      }
    case 'SELL_STOCK_FAIL':
      return {
        message: action.message
      }
    default:
      return state
  }
}

export default ErrorReducers
