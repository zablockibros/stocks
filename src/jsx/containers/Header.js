import React from 'react'
import searchStock from '../components/searchStock'
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import ToolbarTitle from 'material-ui/lib/toolbar/toolbar-title';

const Header = () => (
  <Toolbar>
    <ToolbarGroup float="left">
      <ToolbarTitle text="Your Stock Portfolio" />
    </ToolbarGroup>
    <ToolbarGroup float="right">
      <ToolbarTitle text="Search by symbol:" />
      <searchStock />
    </ToolbarGroup>
  </Toolbar>
)

export default Header
