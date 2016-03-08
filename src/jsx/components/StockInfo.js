import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

class StockInfo extends React.Component {

  componentDidMount() {
    const {dispatch} = this.props;
    dispatch(initEnvironment());
  }

  render() {
    return (
      <div style={{width: '100%'}}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderColumn>Ask</TableHeaderColumn>
              <TableHeaderColumn>Bid</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableRowColumn>Steve Brown</TableRowColumn>
              <TableRowColumn>Employed</TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    environment: state.environment
  }
}

export default connect(mapStateToProps)(StockInfo)
