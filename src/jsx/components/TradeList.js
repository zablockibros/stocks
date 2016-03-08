import React, { PropTypes } from 'react'
import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TableBody from 'material-ui/lib/table/table-body';

const TradeList = ({ stocks, onSelectStock }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHeaderColumn>Symbol</TableHeaderColumn>
        <TableHeaderColumn>Amt.</TableHeaderColumn>
        <TableHeaderColumn>Bid</TableHeaderColumn>
        <TableHeaderColumn>Ask</TableHeaderColumn>
        <TableHeaderColumn></TableHeaderColumn>
      </TableRow>
    </TableHeader>
    <TableBody>
      {stocks.map(stock =>
        <TableRow onClick={onSelectStock(stock.symbol)}>
          <TableRowColumn>{stock.symbol}</TableRowColumn>
          <TableRowColumn>{stock.amt}</TableRowColumn>
          <TableRowColumn>{stock.bid}</TableRowColumn>
          <TableRowColumn>{stock.ask}</TableRowColumn>
          <TableRowColumn>Select</TableRowColumn>
        </TableRow>
      )}
    </TableBody>
  </Table>
)

TradeList.propTypes = {
  todos: PropTypes.arrayOf(PropTypes.shape({
    symbol: PropTypes.string.isRequired,
    amt: PropTypes.number.isRequired,
    bid: PropTypes.number.isRequired,
    ask: PropTypes.number.isRequired,
    active: PropTypes.number.isRequired
  }).isRequired).isRequired,
  onSelectStock: PropTypes.func.isRequired
}

export default TradeList
