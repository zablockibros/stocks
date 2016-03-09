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
    case 'INVALID_SYMBOL':
      return {
        message: `Failed to return ${action.symbol}, try again`
      }
    case 'BAD_SYMBOL':
      return {
        message: action.message
      }
    case 'INIT_STOCK':
        return {
          message : null
        }
    case 'BUY_STOCK':
      return {
        message : null
      }
    case 'SELL_STOCK':
      return {
        message : null
      }
    default:
      return state
  }
}

export default ErrorReducers
