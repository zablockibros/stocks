import React, { PropTypes } from 'react'
import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TableBody from 'material-ui/lib/table/table-body';


let style = {fontFamily: 'Times New Roman',
  fontSize: "24px",
  color: "rgba(0, 0, 0, 0.4)"}
const TradeList = ({ stocks, onSelectStock }) => (
  <div>
    <span style={style}>Your trading:</span>
    <Table selectable={false}>
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
  </div>
)

TradeList.propTypes = {
  stocks: PropTypes.arrayOf(PropTypes.shape({
    symbol: PropTypes.string.isRequired,
    amt: PropTypes.number.isRequired,
    bid: PropTypes.number.isRequired,
    ask: PropTypes.number.isRequired,
    active: PropTypes.number.isRequired
  }).isRequired).isRequired,
  onSelectStock: PropTypes.func.isRequired
}

export default TradeList
