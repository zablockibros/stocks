import React from 'react'
import StockInfo from '../containers/StockInfo'
import ActiveTradeList from '../containers/ActiveTradeList'

const Boxes = () => (
  <div style={{width: '100%'}}>
    <StockInfo />
    <ActiveTradeList />
  </div>
);

export default Boxes
