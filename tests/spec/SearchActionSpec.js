'use strict';

var _reduxMockStore = require('redux-mock-store');

var _reduxMockStore2 = _interopRequireDefault(_reduxMockStore);

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

var _ActionTypes = require('../../src/jsx/constraints/ActionTypes');

var types = _interopRequireWildcard(_ActionTypes);

var _index = require('../../src/jsx/actions/index');

var actions = _interopRequireWildcard(_index);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var middlewares = [_reduxThunk2.default];
var mockStore = (0, _reduxMockStore2.default)(middlewares);

var good_request = {
  "F": {
    "symbol": "F",
    "dxSymbol": "F",
    "exchange": "XNYS",
    "isoExchange": "XNYS",
    "bzExchange": "NYSE",
    "type": "STOCK",
    "name": "Ford Motor",
    "description": "Ford Motor Company Common Stock",
    "sector": "Consumer Cyclical",
    "industry": "Auto Manufacturers",
    "open": 13.56,
    "high": 13.86,
    "low": 13.43,
    "close": 13.59,
    "bidPrice": 12.0,
    "askPrice": 13.95,
    "askSize": 10,
    "bidSize": 0,
    "size": 1875880,
    "bidTime": 1457139600000,
    "askTime": 1457139600000,
    "lastTradePrice": 13.59,
    "lastTradeTime": 1457125230000,
    "volume": 31818610,
    "change": 0.05,
    "changePercent": 0.37,
    "previousClosePrice": 13.54,
    "fiftyDayAveragePrice": 12.429,
    "fiftyTwoWeekHigh": 16.74,
    "fiftyTwoWeekLow": 10.44,
    "marketCap": 53955773875,
    "sharesOutstanding": 3970255620,
    "pe": 7.3765,
    "forwardPE": 6.4103,
    "dividendYield": 4.42,
    "payoutRatio": 32.57,
    "ethPrice": 13.58,
    "ethVolume": 405896,
    "ethTime": 1457139542000
  }
};

var bad_symbol_request = {
  "f": {
    "error": {
      "code": 1,
      "message": "Unknown symbol."
    }
  }
};

describe("Stock Search", function () {
  beforeEach(function () {
    jasmine.Ajax.install();
  });
  afterEach(function () {
    jasmine.Ajax.uninstall();
  });

  it('creates full stock search triggering request and recieve stock actions', function () {
    var doneFn = jasmine.createSpy("success");

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (args) {
      if (this.readyState == this.DONE) {
        doneFn(this.responseText);
      }
    };

    xhr.open("GET", "http://careers-data.benzinga.com/rest/richquote?symbols=F");
    xhr.send();

    expect(jasmine.Ajax.requests.mostRecent().url).toBe('http://careers-data.benzinga.com/rest/richquote?symbols=F');
    expect(doneFn).not.toHaveBeenCalled();

    jasmine.Ajax.requests.mostRecent().respondWith({
      "status": 200,
      "contentType": 'application/json',
      "responseJSON": good_request
    });

    var expectedActions = [{ type: types.REQUEST_STOCK, symbol: 'F' }, { type: types.RECIEVE_STOCK, symbol: 'F', bid: 12.0, ask: 13.95 }];
    var store = mockStore({ todos: [] }, expectedActions);
    store.dispatch(actions.getStock('F'));
  });
  it('creates full stock search triggering request and recieve stock actions for bad symbol', function () {
    var doneFn = jasmine.createSpy("success");

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (args) {
      if (this.readyState == this.DONE) {
        doneFn(this.responseText);
      }
    };

    xhr.open("GET", "http://careers-data.benzinga.com/rest/richquote?symbols=f");
    xhr.send();

    expect(jasmine.Ajax.requests.mostRecent().url).toBe('http://careers-data.benzinga.com/rest/richquote?symbols=f');
    expect(doneFn).not.toHaveBeenCalled();

    jasmine.Ajax.requests.mostRecent().respondWith({
      "status": 200,
      "contentType": 'application/json',
      "responseJSON": bad_symbol_request
    });

    var expectedActions = [{ type: types.REQUEST_STOCK, symbol: 'f' }, { type: types.BAD_SYMBOL, message: 'Unknown symbol.' }];
    var store = mockStore({ todos: [] }, expectedActions);
    store.dispatch(actions.getStock('f'));
  });
  it('creates full stock search triggering request and recieve stock actions with 400 response', function () {
    var doneFn = jasmine.createSpy("success");

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (args) {
      if (this.readyState == this.DONE) {
        doneFn(this.responseText);
      }
    };

    xhr.open("GET", "http://careers-data.benzinga.com/rest/richquote?symbols=F");
    xhr.send();

    expect(jasmine.Ajax.requests.mostRecent().url).toBe('http://careers-data.benzinga.com/rest/richquote?symbols=F');
    expect(doneFn).not.toHaveBeenCalled();

    jasmine.Ajax.requests.mostRecent().respondWith({
      "status": 404
    });

    var expectedActions = [{ type: types.REQUEST_STOCK, symbol: 'F' }, { type: types.INVALID_SYMBOL, symbol: 'F' }];
    var store = mockStore({ todos: [] }, expectedActions);
    store.dispatch(actions.getStock('F'));
  });
});
