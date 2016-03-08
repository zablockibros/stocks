import css from "!css!sass!../sass/site.scss";
import React from 'react';
import thunkMiddleware from 'redux-thunk'
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux'
import portfolioApp from './reducers';
import app from './containers/app';

const store = createStore(
  portfolioApp,
  applyMiddleware(
    thunkMiddleware
  )
)

render(
<Provider store={store}>
  <App />
  </Provider>,
  document.getElementById('root')
)
