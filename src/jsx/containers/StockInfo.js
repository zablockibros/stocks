import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import getStock from '../actions'
import LatestError from './LatestError.js'
import BuyStock from './BuyStock'
import SellStock from './SellStock'
import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TableBody from 'material-ui/lib/table/table-body';

class StockInfo extends Component {

  static propTypes = {
    stocks: PropTypes.array.isRequired
  };

  render() {
    if(this.props.stocks.length > 0){
      return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderColumn>Symbol</TableHeaderColumn>
            <TableHeaderColumn>Ask</TableHeaderColumn>
            <TableHeaderColumn>Bid</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody>
          {this.props.stocks.map(stock =>
            <TableRow>
              <TableRowColumn>stock.symbol</TableRowColumn>
              <TableRowColumn>stock.ask</TableRowColumn>
              <TableRowColumn>stock.bid</TableRowColumn>
            </TableRow>
          )}
          <TableRow>
           <TableRowColumn></TableRowColumn>
           <TableRowColumn><BuyStock /></TableRowColumn>
           <TableRowColumn><SellStock /></TableRowColumn>
           </TableRow>
        </TableBody>
      </Table>
      )
    }
    else{
      return (
        <LatestError />
      )
    }
  }
}

StockInfo.propTypes = {
  stocks: PropTypes.array.isRequired
}

function mapStateToProps(state) {
  if(state.TradeReducers.stocks.length > 0) {
    return {
      stocks: [state.TradeReducers.stocks.sort(function (a, b) {
        if (a.active) return 1; else if (b.active) return -1;
      })[0]]
    }
  }
  else{
    return {
      stocks : []
    }
  }
}


export default connect(mapStateToProps)(StockInfo)
