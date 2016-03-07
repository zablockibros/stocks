const SearchReducers = (state = {}, action) => {
  switch (action.type) {
    case 'REQUEST_STOCK':
      return {
        message: `Searching for ${action.symbol}`
      }
    case 'RECIEVE_STOCK':
      return {

      }
    case 'INVALID_SYMBOL':
      return {
        message: 'Please try to search again later'
      }
    case 'BAD_SYMBOL':
      return {
        message: `${action.symbol}: ${action.message}`
      }
    default:
      return state
  }
}

export default SearchReducers
