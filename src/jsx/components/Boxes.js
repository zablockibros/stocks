import React from 'react'
import StockInfo from '../containers/StockInfo'
import ActiveTradeList from '../containers/ActiveTradeList'
import Paper from 'material-ui/lib/paper';

const Boxes = () => (
  <div style={{width: '100%'}}>
    <Paper style={{width: '40%', minHeight: "400px", margin: "5%", padding: "30px", float: "left"}}>
      <StockInfo />
    </Paper>
    <Paper style={{width: '40%', minHeight: "400px", margin: "5%", padding: "30px", float: "right"}}>
      <ActiveTradeList />
    </Paper>
  </div>
);

export default Boxes
