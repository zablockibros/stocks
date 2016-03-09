import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'
import { getStock } from '../actions'
import TextField from 'material-ui/lib/text-field'
import RaisedButton from 'material-ui/lib/raised-button'

let input;
const style = {
  marginLeft: 12,
  display: "inline-block",
};
class SearchStock extends Component {

  constructor(props){
    super(props);

    this.state = {
      value: '',
    }
  }
  handleChange = (event) => {
    this.setState({
      value: event.target.value,
    })
  }

  render(){
    const {dispatch} = this.props;
    return(
      <form onSubmit={e => {
        e.preventDefault();
        if (!this.state.value.trim()) {
          return
        }
        dispatch(getStock(this.state.value.toUpperCase()))
      }}>
        <TextField value={this.state.value} onChange={this.handleChange} style={style}  />
        <RaisedButton label="Search stock" secondary={true} style={style} type="submit" />
      </form>
    )
  }
}

SearchStock = connect()(SearchStock);

export default SearchStock
