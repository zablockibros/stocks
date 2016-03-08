import React, { Component, PropTypes } from 'react';
import SearchStock from '../containers/searchStock'
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import ToolbarTitle from 'material-ui/lib/toolbar/toolbar-title';

const Header = () => (
      <div>
        <Toolbar>
          <ToolbarGroup float="left">
            <ToolbarTitle text="Your Stock Portfolio"/>
          </ToolbarGroup>
          <ToolbarGroup float="right">
            <ToolbarTitle text="Search by symbol:"/>
            <SearchStock />
          </ToolbarGroup>
        </Toolbar>
      </div>
)

export default Header
