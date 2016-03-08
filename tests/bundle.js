/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(1);
	__webpack_require__(2);

/***/ },
/* 1 */
/***/ function(module, exports) {

	/*

	Jasmine-Ajax - v3.2.0: a set of helpers for testing AJAX requests under the Jasmine
	BDD framework for JavaScript.

	http://github.com/jasmine/jasmine-ajax

	Jasmine Home page: http://jasmine.github.io/

	Copyright (c) 2008-2015 Pivotal Labs

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

	*/

	getJasmineRequireObj().ajax = function(jRequire) {
	  var $ajax = {};

	  $ajax.RequestStub = jRequire.AjaxRequestStub();
	  $ajax.RequestTracker = jRequire.AjaxRequestTracker();
	  $ajax.StubTracker = jRequire.AjaxStubTracker();
	  $ajax.ParamParser = jRequire.AjaxParamParser();
	  $ajax.event = jRequire.AjaxEvent();
	  $ajax.eventBus = jRequire.AjaxEventBus($ajax.event);
	  $ajax.fakeRequest = jRequire.AjaxFakeRequest($ajax.eventBus);
	  $ajax.MockAjax = jRequire.MockAjax($ajax);

	  return $ajax.MockAjax;
	};

	getJasmineRequireObj().AjaxEvent = function() {
	  function now() {
	    return new Date().getTime();
	  }

	  function noop() {
	  }

	  // Event object
	  // https://dom.spec.whatwg.org/#concept-event
	  function XMLHttpRequestEvent(xhr, type) {
	    this.type = type;
	    this.bubbles = false;
	    this.cancelable = false;
	    this.timeStamp = now();

	    this.isTrusted = false;
	    this.defaultPrevented = false;

	    // Event phase should be "AT_TARGET"
	    // https://dom.spec.whatwg.org/#dom-event-at_target
	    this.eventPhase = 2;

	    this.target = xhr;
	    this.currentTarget = xhr;
	  }

	  XMLHttpRequestEvent.prototype.preventDefault = noop;
	  XMLHttpRequestEvent.prototype.stopPropagation = noop;
	  XMLHttpRequestEvent.prototype.stopImmediatePropagation = noop;

	  function XMLHttpRequestProgressEvent() {
	    XMLHttpRequestEvent.apply(this, arguments);

	    this.lengthComputable = false;
	    this.loaded = 0;
	    this.total = 0;
	  }

	  // Extend prototype
	  XMLHttpRequestProgressEvent.prototype = XMLHttpRequestEvent.prototype;

	  return {
	    event: function(xhr, type) {
	      return new XMLHttpRequestEvent(xhr, type);
	    },

	    progressEvent: function(xhr, type) {
	      return new XMLHttpRequestProgressEvent(xhr, type);
	    }
	  };
	};
	getJasmineRequireObj().AjaxEventBus = function(eventFactory) {
	  function EventBus(source) {
	    this.eventList = {};
	    this.source = source;
	  }

	  function ensureEvent(eventList, name) {
	    eventList[name] = eventList[name] || [];
	    return eventList[name];
	  }

	  function findIndex(list, thing) {
	    if (list.indexOf) {
	      return list.indexOf(thing);
	    }

	    for(var i = 0; i < list.length; i++) {
	      if (thing === list[i]) {
	        return i;
	      }
	    }

	    return -1;
	  }

	  EventBus.prototype.addEventListener = function(event, callback) {
	    ensureEvent(this.eventList, event).push(callback);
	  };

	  EventBus.prototype.removeEventListener = function(event, callback) {
	    var index = findIndex(this.eventList[event], callback);

	    if (index >= 0) {
	      this.eventList[event].splice(index, 1);
	    }
	  };

	  EventBus.prototype.trigger = function(event) {
	    var evt;

	    // Event 'readystatechange' is should be a simple event.
	    // Others are progress event.
	    // https://xhr.spec.whatwg.org/#events
	    if (event === 'readystatechange') {
	      evt = eventFactory.event(this.source, event);
	    } else {
	      evt = eventFactory.progressEvent(this.source, event);
	    }

	    var eventListeners = this.eventList[event];

	    if (eventListeners) {
	      for (var i = 0; i < eventListeners.length; i++) {
	        eventListeners[i].call(this.source, evt);
	      }
	    }
	  };

	  return function(source) {
	    return new EventBus(source);
	  };
	};

	getJasmineRequireObj().AjaxFakeRequest = function(eventBusFactory) {
	  function extend(destination, source, propertiesToSkip) {
	    propertiesToSkip = propertiesToSkip || [];
	    for (var property in source) {
	      if (!arrayContains(propertiesToSkip, property)) {
	        destination[property] = source[property];
	      }
	    }
	    return destination;
	  }

	  function arrayContains(arr, item) {
	    for (var i = 0; i < arr.length; i++) {
	      if (arr[i] === item) {
	        return true;
	      }
	    }
	    return false;
	  }

	  function wrapProgressEvent(xhr, eventName) {
	    return function() {
	      if (xhr[eventName]) {
	        xhr[eventName].apply(xhr, arguments);
	      }
	    };
	  }

	  function initializeEvents(xhr) {
	    xhr.eventBus.addEventListener('readystatechange', wrapProgressEvent(xhr, 'onreadystatechange'));
	    xhr.eventBus.addEventListener('loadstart', wrapProgressEvent(xhr, 'onloadstart'));
	    xhr.eventBus.addEventListener('load', wrapProgressEvent(xhr, 'onload'));
	    xhr.eventBus.addEventListener('loadend', wrapProgressEvent(xhr, 'onloadend'));
	    xhr.eventBus.addEventListener('progress', wrapProgressEvent(xhr, 'onprogress'));
	    xhr.eventBus.addEventListener('error', wrapProgressEvent(xhr, 'onerror'));
	    xhr.eventBus.addEventListener('abort', wrapProgressEvent(xhr, 'onabort'));
	    xhr.eventBus.addEventListener('timeout', wrapProgressEvent(xhr, 'ontimeout'));
	  }

	  function unconvertibleResponseTypeMessage(type) {
	    var msg = [
	      "Can't build XHR.response for XHR.responseType of '",
	      type,
	      "'.",
	      "XHR.response must be explicitly stubbed"
	    ];
	    return msg.join(' ');
	  }

	  function fakeRequest(global, requestTracker, stubTracker, paramParser) {
	    function FakeXMLHttpRequest() {
	      requestTracker.track(this);
	      this.eventBus = eventBusFactory(this);
	      initializeEvents(this);
	      this.requestHeaders = {};
	      this.overriddenMimeType = null;
	    }

	    function findHeader(name, headers) {
	      name = name.toLowerCase();
	      for (var header in headers) {
	        if (header.toLowerCase() === name) {
	          return headers[header];
	        }
	      }
	    }

	    function normalizeHeaders(rawHeaders, contentType) {
	      var headers = [];

	      if (rawHeaders) {
	        if (rawHeaders instanceof Array) {
	          headers = rawHeaders;
	        } else {
	          for (var headerName in rawHeaders) {
	            if (rawHeaders.hasOwnProperty(headerName)) {
	              headers.push({ name: headerName, value: rawHeaders[headerName] });
	            }
	          }
	        }
	      } else {
	        headers.push({ name: "Content-Type", value: contentType || "application/json" });
	      }

	      return headers;
	    }

	    function parseXml(xmlText, contentType) {
	      if (global.DOMParser) {
	        return (new global.DOMParser()).parseFromString(xmlText, 'text/xml');
	      } else {
	        var xml = new global.ActiveXObject("Microsoft.XMLDOM");
	        xml.async = "false";
	        xml.loadXML(xmlText);
	        return xml;
	      }
	    }

	    var xmlParsables = ['text/xml', 'application/xml'];

	    function getResponseXml(responseText, contentType) {
	      if (arrayContains(xmlParsables, contentType.toLowerCase())) {
	        return parseXml(responseText, contentType);
	      } else if (contentType.match(/\+xml$/)) {
	        return parseXml(responseText, 'text/xml');
	      }
	      return null;
	    }

	    var iePropertiesThatCannotBeCopied = ['responseBody', 'responseText', 'responseXML', 'status', 'statusText', 'responseTimeout'];
	    extend(FakeXMLHttpRequest.prototype, new global.XMLHttpRequest(), iePropertiesThatCannotBeCopied);
	    extend(FakeXMLHttpRequest.prototype, {
	      open: function() {
	        this.method = arguments[0];
	        this.url = arguments[1];
	        this.username = arguments[3];
	        this.password = arguments[4];
	        this.readyState = 1;
	        this.eventBus.trigger('readystatechange');
	      },

	      setRequestHeader: function(header, value) {
	        if(this.requestHeaders.hasOwnProperty(header)) {
	          this.requestHeaders[header] = [this.requestHeaders[header], value].join(', ');
	        } else {
	          this.requestHeaders[header] = value;
	        }
	      },

	      overrideMimeType: function(mime) {
	        this.overriddenMimeType = mime;
	      },

	      abort: function() {
	        this.readyState = 0;
	        this.status = 0;
	        this.statusText = "abort";
	        this.eventBus.trigger('readystatechange');
	        this.eventBus.trigger('progress');
	        this.eventBus.trigger('abort');
	        this.eventBus.trigger('loadend');
	      },

	      readyState: 0,

	      onloadstart: null,
	      onprogress: null,
	      onabort: null,
	      onerror: null,
	      onload: null,
	      ontimeout: null,
	      onloadend: null,
	      onreadystatechange: null,

	      addEventListener: function() {
	        this.eventBus.addEventListener.apply(this.eventBus, arguments);
	      },

	      removeEventListener: function(event, callback) {
	        this.eventBus.removeEventListener.apply(this.eventBus, arguments);
	      },

	      status: null,

	      send: function(data) {
	        this.params = data;
	        this.eventBus.trigger('loadstart');

	        var stub = stubTracker.findStub(this.url, data, this.method);
	        if (stub) {
	          if (stub.isReturn()) {
	            this.respondWith(stub);
	          } else if (stub.isError()) {
	            this.responseError();
	          } else if (stub.isTimeout()) {
	            this.responseTimeout();
	          }
	        }
	      },

	      contentType: function() {
	        return findHeader('content-type', this.requestHeaders);
	      },

	      data: function() {
	        if (!this.params) {
	          return {};
	        }

	        return paramParser.findParser(this).parse(this.params);
	      },

	      getResponseHeader: function(name) {
	        name = name.toLowerCase();
	        var resultHeader;
	        for(var i = 0; i < this.responseHeaders.length; i++) {
	          var header = this.responseHeaders[i];
	          if (name === header.name.toLowerCase()) {
	            if (resultHeader) {
	              resultHeader = [resultHeader, header.value].join(', ');
	            } else {
	              resultHeader = header.value;
	            }
	          }
	        }
	        return resultHeader;
	      },

	      getAllResponseHeaders: function() {
	        var responseHeaders = [];
	        for (var i = 0; i < this.responseHeaders.length; i++) {
	          responseHeaders.push(this.responseHeaders[i].name + ': ' +
	            this.responseHeaders[i].value);
	        }
	        return responseHeaders.join('\r\n') + '\r\n';
	      },

	      responseText: null,
	      response: null,
	      responseType: null,

	      responseValue: function() {
	        switch(this.responseType) {
	          case null:
	          case "":
	          case "text":
	            return this.readyState >= 3 ? this.responseText : "";
	          case "json":
	            return JSON.parse(this.responseText);
	          case "arraybuffer":
	            throw unconvertibleResponseTypeMessage('arraybuffer');
	          case "blob":
	            throw unconvertibleResponseTypeMessage('blob');
	          case "document":
	            return this.responseXML;
	        }
	      },


	      respondWith: function(response) {
	        if (this.readyState === 4) {
	          throw new Error("FakeXMLHttpRequest already completed");
	        }

	        this.status = response.status;
	        this.statusText = response.statusText || "";
	        this.responseHeaders = normalizeHeaders(response.responseHeaders, response.contentType);
	        this.readyState = 2;
	        this.eventBus.trigger('readystatechange');

	        this.responseText = response.responseText || "";
	        this.responseType = response.responseType || "";
	        this.readyState = 4;
	        this.responseXML = getResponseXml(response.responseText, this.getResponseHeader('content-type') || '');
	        if (this.responseXML) {
	          this.responseType = 'document';
	        }

	        if ('response' in response) {
	          this.response = response.response;
	        } else {
	          this.response = this.responseValue();
	        }

	        this.eventBus.trigger('readystatechange');
	        this.eventBus.trigger('progress');
	        this.eventBus.trigger('load');
	        this.eventBus.trigger('loadend');
	      },

	      responseTimeout: function() {
	        if (this.readyState === 4) {
	          throw new Error("FakeXMLHttpRequest already completed");
	        }
	        this.readyState = 4;
	        jasmine.clock().tick(30000);
	        this.eventBus.trigger('readystatechange');
	        this.eventBus.trigger('progress');
	        this.eventBus.trigger('timeout');
	        this.eventBus.trigger('loadend');
	      },

	      responseError: function() {
	        if (this.readyState === 4) {
	          throw new Error("FakeXMLHttpRequest already completed");
	        }
	        this.readyState = 4;
	        this.eventBus.trigger('readystatechange');
	        this.eventBus.trigger('progress');
	        this.eventBus.trigger('error');
	        this.eventBus.trigger('loadend');
	      }
	    });

	    return FakeXMLHttpRequest;
	  }

	  return fakeRequest;
	};

	getJasmineRequireObj().MockAjax = function($ajax) {
	  function MockAjax(global) {
	    var requestTracker = new $ajax.RequestTracker(),
	      stubTracker = new $ajax.StubTracker(),
	      paramParser = new $ajax.ParamParser(),
	      realAjaxFunction = global.XMLHttpRequest,
	      mockAjaxFunction = $ajax.fakeRequest(global, requestTracker, stubTracker, paramParser);

	    this.install = function() {
	      if (global.XMLHttpRequest === mockAjaxFunction) {
	        throw "MockAjax is already installed.";
	      }

	      global.XMLHttpRequest = mockAjaxFunction;
	    };

	    this.uninstall = function() {
	      global.XMLHttpRequest = realAjaxFunction;

	      this.stubs.reset();
	      this.requests.reset();
	      paramParser.reset();
	    };

	    this.stubRequest = function(url, data, method) {
	      var stub = new $ajax.RequestStub(url, data, method);
	      stubTracker.addStub(stub);
	      return stub;
	    };

	    this.withMock = function(closure) {
	      this.install();
	      try {
	        closure();
	      } finally {
	        this.uninstall();
	      }
	    };

	    this.addCustomParamParser = function(parser) {
	      paramParser.add(parser);
	    };

	    this.requests = requestTracker;
	    this.stubs = stubTracker;
	  }

	  return MockAjax;
	};

	getJasmineRequireObj().AjaxParamParser = function() {
	  function ParamParser() {
	    var defaults = [
	      {
	        test: function(xhr) {
	          return (/^application\/json/).test(xhr.contentType());
	        },
	        parse: function jsonParser(paramString) {
	          return JSON.parse(paramString);
	        }
	      },
	      {
	        test: function(xhr) {
	          return true;
	        },
	        parse: function naiveParser(paramString) {
	          var data = {};
	          var params = paramString.split('&');

	          for (var i = 0; i < params.length; ++i) {
	            var kv = params[i].replace(/\+/g, ' ').split('=');
	            var key = decodeURIComponent(kv[0]);
	            data[key] = data[key] || [];
	            data[key].push(decodeURIComponent(kv[1]));
	          }
	          return data;
	        }
	      }
	    ];
	    var paramParsers = [];

	    this.add = function(parser) {
	      paramParsers.unshift(parser);
	    };

	    this.findParser = function(xhr) {
	        for(var i in paramParsers) {
	          var parser = paramParsers[i];
	          if (parser.test(xhr)) {
	            return parser;
	          }
	        }
	    };

	    this.reset = function() {
	      paramParsers = [];
	      for(var i in defaults) {
	        paramParsers.push(defaults[i]);
	      }
	    };

	    this.reset();
	  }

	  return ParamParser;
	};

	getJasmineRequireObj().AjaxRequestStub = function() {
	  var RETURN = 0,
	      ERROR = 1,
	      TIMEOUT = 2;

	  function RequestStub(url, stubData, method) {
	    var normalizeQuery = function(query) {
	      return query ? query.split('&').sort().join('&') : undefined;
	    };

	    if (url instanceof RegExp) {
	      this.url = url;
	      this.query = undefined;
	    } else {
	      var split = url.split('?');
	      this.url = split[0];
	      this.query = split.length > 1 ? normalizeQuery(split[1]) : undefined;
	    }

	    this.data = (stubData instanceof RegExp) ? stubData : normalizeQuery(stubData);
	    this.method = method;

	    this.andReturn = function(options) {
	      this.action = RETURN;
	      this.status = options.status || 200;

	      this.contentType = options.contentType;
	      this.response = options.response;
	      this.responseText = options.responseText;
	      this.responseHeaders = options.responseHeaders;
	    };

	    this.isReturn = function() {
	      return this.action === RETURN;
	    };

	    this.andError = function() {
	      this.action = ERROR;
	    };

	    this.isError = function() {
	      return this.action === ERROR;
	    };

	    this.andTimeout = function() {
	      this.action = TIMEOUT;
	    };

	    this.isTimeout = function() {
	      return this.action === TIMEOUT;
	    };

	    this.matches = function(fullUrl, data, method) {
	      var urlMatches = false;
	      fullUrl = fullUrl.toString();
	      if (this.url instanceof RegExp) {
	        urlMatches = this.url.test(fullUrl);
	      } else {
	        var urlSplit = fullUrl.split('?'),
	            url = urlSplit[0],
	            query = urlSplit[1];
	        urlMatches = this.url === url && this.query === normalizeQuery(query);
	      }
	      var dataMatches = false;
	      if (this.data instanceof RegExp) {
	        dataMatches = this.data.test(data);
	      } else {
	        dataMatches = !this.data || this.data === normalizeQuery(data);
	      }
	      return urlMatches && dataMatches && (!this.method || this.method === method);
	    };
	  }

	  return RequestStub;
	};

	getJasmineRequireObj().AjaxRequestTracker = function() {
	  function RequestTracker() {
	    var requests = [];

	    this.track = function(request) {
	      requests.push(request);
	    };

	    this.first = function() {
	      return requests[0];
	    };

	    this.count = function() {
	      return requests.length;
	    };

	    this.reset = function() {
	      requests = [];
	    };

	    this.mostRecent = function() {
	      return requests[requests.length - 1];
	    };

	    this.at = function(index) {
	      return requests[index];
	    };

	    this.filter = function(url_to_match) {
	      var matching_requests = [];

	      for (var i = 0; i < requests.length; i++) {
	        if (url_to_match instanceof RegExp &&
	            url_to_match.test(requests[i].url)) {
	            matching_requests.push(requests[i]);
	        } else if (url_to_match instanceof Function &&
	            url_to_match(requests[i])) {
	            matching_requests.push(requests[i]);
	        } else {
	          if (requests[i].url === url_to_match) {
	            matching_requests.push(requests[i]);
	          }
	        }
	      }

	      return matching_requests;
	    };
	  }

	  return RequestTracker;
	};

	getJasmineRequireObj().AjaxStubTracker = function() {
	  function StubTracker() {
	    var stubs = [];

	    this.addStub = function(stub) {
	      stubs.push(stub);
	    };

	    this.reset = function() {
	      stubs = [];
	    };

	    this.findStub = function(url, data, method) {
	      for (var i = stubs.length - 1; i >= 0; i--) {
	        var stub = stubs[i];
	        if (stub.matches(url, data, method)) {
	          return stub;
	        }
	      }
	    };
	  }

	  return StubTracker;
	};

	(function() {
	  var jRequire = getJasmineRequireObj(),
	      MockAjax = jRequire.ajax(jRequire);
	  if (typeof window === "undefined" && typeof exports === "object") {
	    exports.MockAjax = MockAjax;
	    jasmine.Ajax = new MockAjax(exports);
	  } else {
	    window.MockAjax = MockAjax;
	    jasmine.Ajax = new MockAjax(window);
	  }
	}());


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _reduxMockStore = __webpack_require__(3);

	var _reduxMockStore2 = _interopRequireDefault(_reduxMockStore);

	var _reduxThunk = __webpack_require__(38);

	var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

	var _ActionTypes = __webpack_require__(39);

	var types = _interopRequireWildcard(_ActionTypes);

	var _index = __webpack_require__(40);

	var actions = _interopRequireWildcard(_index);

	function _interopRequireWildcard(obj) {
	  if (obj && obj.__esModule) {
	    return obj;
	  } else {
	    var newObj = {};if (obj != null) {
	      for (var key in obj) {
	        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
	      }
	    }newObj.default = obj;return newObj;
	  }
	}

	function _interopRequireDefault(obj) {
	  return obj && obj.__esModule ? obj : { default: obj };
	}

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

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports['default'] = configureStore;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

	var _expect = __webpack_require__(4);

	var _expect2 = _interopRequireDefault(_expect);

	var _redux = __webpack_require__(27);

	var isFunction = function isFunction(arg) {
	  return typeof arg === 'function';
	};

	function configureStore() {
	  var middlewares = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

	  return function mockStore(_getState, expectedActions, done) {
	    if (!expectedActions) {
	      throw new Error('expectedActions should be an expected action or an array of actions.');
	    } else if (!Array.isArray(expectedActions)) {
	      expectedActions = [expectedActions];
	    } else {
	      expectedActions = Array.prototype.slice.call(expectedActions);
	    }

	    if (typeof done !== 'undefined' && !isFunction(done)) {
	      throw new Error('done should either be undefined or function.');
	    }

	    function mockStoreWithoutMiddleware() {
	      var self = {
	        getState: function getState() {
	          return isFunction(_getState) ? _getState() : _getState;
	        },

	        dispatch: function dispatch(action) {
	          if (isFunction(action)) {
	            return action(self);
	          }

	          var expectedAction = expectedActions.shift();

	          try {
	            if (isFunction(expectedAction)) {
	              expectedAction(action);
	            } else {
	              (0, _expect2['default'])(action).toEqual(expectedAction);
	            }

	            if (done && !expectedActions.length) {
	              done();
	            }

	            return action;
	          } catch (e) {
	            if (done) {
	              done(e);
	            }
	            throw e;
	          }
	        }
	      };

	      return self;
	    }

	    var mockStoreWithMiddleware = _redux.applyMiddleware.apply(undefined, _toConsumableArray(middlewares))(mockStoreWithoutMiddleware);

	    return mockStoreWithMiddleware();
	  };
	}

	module.exports = exports['default'];

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _Expectation = __webpack_require__(5);

	var _Expectation2 = _interopRequireDefault(_Expectation);

	var _SpyUtils = __webpack_require__(24);

	var _assert = __webpack_require__(22);

	var _assert2 = _interopRequireDefault(_assert);

	var _extend = __webpack_require__(26);

	var _extend2 = _interopRequireDefault(_extend);

	function expect(actual) {
	  return new _Expectation2['default'](actual);
	}

	expect.createSpy = _SpyUtils.createSpy;
	expect.spyOn = _SpyUtils.spyOn;
	expect.isSpy = _SpyUtils.isSpy;
	expect.restoreSpies = _SpyUtils.restoreSpies;
	expect.assert = _assert2['default'];
	expect.extend = _extend2['default'];

	exports['default'] = expect;
	module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _isEqual = __webpack_require__(6);

	var _isEqual2 = _interopRequireDefault(_isEqual);

	var _isRegex = __webpack_require__(17);

	var _isRegex2 = _interopRequireDefault(_isRegex);

	var _assert = __webpack_require__(22);

	var _assert2 = _interopRequireDefault(_assert);

	var _SpyUtils = __webpack_require__(24);

	var _TestUtils = __webpack_require__(25);

	/**
	 * An Expectation is a wrapper around an assertion that allows it to be written
	 * in a more natural style, without the need to remember the order of arguments.
	 * This helps prevent you from making mistakes when writing tests.
	 */

	var Expectation = (function () {
	  function Expectation(actual) {
	    _classCallCheck(this, Expectation);

	    this.actual = actual;

	    if (_TestUtils.isFunction(actual)) {
	      this.context = null;
	      this.args = [];
	    }
	  }

	  Expectation.prototype.toExist = function toExist(message) {
	    _assert2['default'](this.actual, message || 'Expected %s to exist', this.actual);

	    return this;
	  };

	  Expectation.prototype.toNotExist = function toNotExist(message) {
	    _assert2['default'](!this.actual, message || 'Expected %s to not exist', this.actual);

	    return this;
	  };

	  Expectation.prototype.toBe = function toBe(value, message) {
	    _assert2['default'](this.actual === value, message || 'Expected %s to be %s', this.actual, value);

	    return this;
	  };

	  Expectation.prototype.toNotBe = function toNotBe(value, message) {
	    _assert2['default'](this.actual !== value, message || 'Expected %s to not be %s', this.actual, value);

	    return this;
	  };

	  Expectation.prototype.toEqual = function toEqual(value, message) {
	    try {
	      _assert2['default'](_isEqual2['default'](this.actual, value), message || 'Expected %s to equal %s', this.actual, value);
	    } catch (e) {
	      // These attributes are consumed by Mocha to produce a diff output.
	      e.showDiff = true;
	      e.actual = this.actual;
	      e.expected = value;
	      throw e;
	    }

	    return this;
	  };

	  Expectation.prototype.toNotEqual = function toNotEqual(value, message) {
	    _assert2['default'](!_isEqual2['default'](this.actual, value), message || 'Expected %s to not equal %s', this.actual, value);

	    return this;
	  };

	  Expectation.prototype.toThrow = function toThrow(value, message) {
	    _assert2['default'](_TestUtils.isFunction(this.actual), 'The "actual" argument in expect(actual).toThrow() must be a function, %s was given', this.actual);

	    _assert2['default'](_TestUtils.functionThrows(this.actual, this.context, this.args, value), message || 'Expected %s to throw %s', this.actual, value || 'an error');

	    return this;
	  };

	  Expectation.prototype.toNotThrow = function toNotThrow(value, message) {
	    _assert2['default'](_TestUtils.isFunction(this.actual), 'The "actual" argument in expect(actual).toNotThrow() must be a function, %s was given', this.actual);

	    _assert2['default'](!_TestUtils.functionThrows(this.actual, this.context, this.args, value), message || 'Expected %s to not throw %s', this.actual, value || 'an error');

	    return this;
	  };

	  Expectation.prototype.toBeA = function toBeA(value, message) {
	    _assert2['default'](_TestUtils.isFunction(value) || typeof value === 'string', 'The "value" argument in toBeA(value) must be a function or a string');

	    _assert2['default'](_TestUtils.isA(this.actual, value), message || 'Expected %s to be a %s', this.actual, value);

	    return this;
	  };

	  Expectation.prototype.toNotBeA = function toNotBeA(value, message) {
	    _assert2['default'](_TestUtils.isFunction(value) || typeof value === 'string', 'The "value" argument in toNotBeA(value) must be a function or a string');

	    _assert2['default'](!_TestUtils.isA(this.actual, value), message || 'Expected %s to be a %s', this.actual, value);

	    return this;
	  };

	  Expectation.prototype.toMatch = function toMatch(pattern, message) {
	    _assert2['default'](typeof this.actual === 'string', 'The "actual" argument in expect(actual).toMatch() must be a string');

	    _assert2['default'](_isRegex2['default'](pattern), 'The "value" argument in toMatch(value) must be a RegExp');

	    _assert2['default'](pattern.test(this.actual), message || 'Expected %s to match %s', this.actual, pattern);

	    return this;
	  };

	  Expectation.prototype.toNotMatch = function toNotMatch(pattern, message) {
	    _assert2['default'](typeof this.actual === 'string', 'The "actual" argument in expect(actual).toNotMatch() must be a string');

	    _assert2['default'](_isRegex2['default'](pattern), 'The "value" argument in toNotMatch(value) must be a RegExp');

	    _assert2['default'](!pattern.test(this.actual), message || 'Expected %s to not match %s', this.actual, pattern);

	    return this;
	  };

	  Expectation.prototype.toBeLessThan = function toBeLessThan(value, message) {
	    _assert2['default'](typeof this.actual === 'number', 'The "actual" argument in expect(actual).toBeLessThan() must be a number');

	    _assert2['default'](typeof value === 'number', 'The "value" argument in toBeLessThan(value) must be a number');

	    _assert2['default'](this.actual < value, message || 'Expected %s to be less than %s', this.actual, value);

	    return this;
	  };

	  Expectation.prototype.toBeLessThanOrEqualTo = function toBeLessThanOrEqualTo(value, message) {
	    _assert2['default'](typeof this.actual === 'number', 'The "actual" argument in expect(actual).toBeLessThanOrEqualTo() must be a number');

	    _assert2['default'](typeof value === 'number', 'The "value" argument in toBeLessThanOrEqualTo(value) must be a number');

	    _assert2['default'](this.actual <= value, message || 'Expected %s to be less than or equal to %s', this.actual, value);

	    return this;
	  };

	  Expectation.prototype.toBeGreaterThan = function toBeGreaterThan(value, message) {
	    _assert2['default'](typeof this.actual === 'number', 'The "actual" argument in expect(actual).toBeGreaterThan() must be a number');

	    _assert2['default'](typeof value === 'number', 'The "value" argument in toBeGreaterThan(value) must be a number');

	    _assert2['default'](this.actual > value, message || 'Expected %s to be greater than %s', this.actual, value);

	    return this;
	  };

	  Expectation.prototype.toBeGreaterThanOrEqualTo = function toBeGreaterThanOrEqualTo(value, message) {
	    _assert2['default'](typeof this.actual === 'number', 'The "actual" argument in expect(actual).toBeGreaterThanOrEqualTo() must be a number');

	    _assert2['default'](typeof value === 'number', 'The "value" argument in toBeGreaterThanOrEqualTo(value) must be a number');

	    _assert2['default'](this.actual >= value, message || 'Expected %s to be greater than or equal to %s', this.actual, value);

	    return this;
	  };

	  Expectation.prototype.toInclude = function toInclude(value, compareValues, message) {
	    _assert2['default'](_TestUtils.isArray(this.actual) || typeof this.actual === 'string', 'The "actual" argument in expect(actual).toInclude() must be an array or a string');

	    if (typeof compareValues === 'string') {
	      message = compareValues;
	      compareValues = null;
	    }

	    message = message || 'Expected %s to include %s';

	    if (_TestUtils.isArray(this.actual)) {
	      _assert2['default'](_TestUtils.arrayContains(this.actual, value, compareValues), message, this.actual, value);
	    } else {
	      _assert2['default'](_TestUtils.stringContains(this.actual, value), message, this.actual, value);
	    }

	    return this;
	  };

	  Expectation.prototype.toExclude = function toExclude(value, compareValues, message) {
	    _assert2['default'](_TestUtils.isArray(this.actual) || typeof this.actual === 'string', 'The "actual" argument in expect(actual).toExclude() must be an array or a string');

	    if (typeof compareValues === 'string') {
	      message = compareValues;
	      compareValues = null;
	    }

	    message = message || 'Expected %s to exclude %s';

	    if (_TestUtils.isArray(this.actual)) {
	      _assert2['default'](!_TestUtils.arrayContains(this.actual, value, compareValues), message, this.actual, value);
	    } else {
	      _assert2['default'](!_TestUtils.stringContains(this.actual, value), message, this.actual, value);
	    }

	    return this;
	  };

	  Expectation.prototype.toHaveBeenCalled = function toHaveBeenCalled(message) {
	    var spy = this.actual;

	    _assert2['default'](_SpyUtils.isSpy(spy), 'The "actual" argument in expect(actual).toHaveBeenCalled() must be a spy');

	    _assert2['default'](spy.calls.length > 0, message || 'spy was not called');

	    return this;
	  };

	  Expectation.prototype.toHaveBeenCalledWith = function toHaveBeenCalledWith() {
	    var spy = this.actual;

	    _assert2['default'](_SpyUtils.isSpy(spy), 'The "actual" argument in expect(actual).toHaveBeenCalledWith() must be a spy');

	    var expectedArgs = Array.prototype.slice.call(arguments, 0);

	    _assert2['default'](spy.calls.some(function (call) {
	      return _isEqual2['default'](call.arguments, expectedArgs);
	    }), 'spy was never called with %s', expectedArgs);

	    return this;
	  };

	  Expectation.prototype.toNotHaveBeenCalled = function toNotHaveBeenCalled(message) {
	    var spy = this.actual;

	    _assert2['default'](_SpyUtils.isSpy(spy), 'The "actual" argument in expect(actual).toNotHaveBeenCalled() must be a spy');

	    _assert2['default'](spy.calls.length === 0, message || 'spy was not supposed to be called');

	    return this;
	  };

	  Expectation.prototype.withContext = function withContext(context) {
	    _assert2['default'](_TestUtils.isFunction(this.actual), 'The "actual" argument in expect(actual).withContext() must be a function');

	    this.context = context;

	    return this;
	  };

	  Expectation.prototype.withArgs = function withArgs() {
	    _assert2['default'](_TestUtils.isFunction(this.actual), 'The "actual" argument in expect(actual).withArgs() must be a function');

	    if (arguments.length) this.args = this.args.concat(Array.prototype.slice.call(arguments, 0));

	    return this;
	  };

	  return Expectation;
	})();

	var aliases = {
	  toBeAn: 'toBeA',
	  toNotBeAn: 'toNotBeA',
	  toBeTruthy: 'toExist',
	  toBeFalsy: 'toNotExist',
	  toBeFewerThan: 'toBeLessThan',
	  toBeMoreThan: 'toBeGreaterThan',
	  toContain: 'toInclude',
	  toNotContain: 'toExclude'
	};

	for (var alias in aliases) {
	  Expectation.prototype[alias] = Expectation.prototype[aliases[alias]];
	}exports['default'] = Expectation;
	module.exports = exports['default'];

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var whyNotEqual = __webpack_require__(7);

	module.exports = function isEqual(value, other) {
		return whyNotEqual(value, other) === '';
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var ObjectPrototype = Object.prototype;
	var toStr = ObjectPrototype.toString;
	var booleanValue = Boolean.prototype.valueOf;
	var has = __webpack_require__(8);
	var isArrowFunction = __webpack_require__(11);
	var isBoolean = __webpack_require__(13);
	var isDate = __webpack_require__(14);
	var isGenerator = __webpack_require__(15);
	var isNumber = __webpack_require__(16);
	var isRegex = __webpack_require__(17);
	var isString = __webpack_require__(18);
	var isSymbol = __webpack_require__(19);
	var isCallable = __webpack_require__(12);

	var isProto = Object.prototype.isPrototypeOf;

	var foo = function foo() {};
	var functionsHaveNames = foo.name === 'foo';

	var symbolValue = typeof Symbol === 'function' ? Symbol.prototype.valueOf : null;
	var symbolIterator = __webpack_require__(20)();

	var collectionsForEach = __webpack_require__(21)();

	var getPrototypeOf = Object.getPrototypeOf;
	if (!getPrototypeOf) {
		/* eslint-disable no-proto */
		if (typeof 'test'.__proto__ === 'object') {
			getPrototypeOf = function (obj) {
				return obj.__proto__;
			};
		} else {
			getPrototypeOf = function (obj) {
				var constructor = obj.constructor,
					oldConstructor;
				if (has(obj, 'constructor')) {
					oldConstructor = constructor;
					if (!(delete obj.constructor)) { // reset constructor
						return null; // can't delete obj.constructor, return null
					}
					constructor = obj.constructor; // get real constructor
					obj.constructor = oldConstructor; // restore constructor
				}
				return constructor ? constructor.prototype : ObjectPrototype; // needed for IE
			};
		}
		/* eslint-enable no-proto */
	}

	var isArray = Array.isArray || function (value) {
		return toStr.call(value) === '[object Array]';
	};

	var normalizeFnWhitespace = function normalizeFnWhitespace(fnStr) {
		// this is needed in IE 9, at least, which has inconsistencies here.
		return fnStr.replace(/^function ?\(/, 'function (').replace('){', ') {');
	};

	var tryMapSetEntries = function tryMapSetEntries(collection) {
		var foundEntries = [];
		try {
			collectionsForEach.Map.call(collection, function (key, value) {
				foundEntries.push([key, value]);
			});
		} catch (notMap) {
			try {
				collectionsForEach.Set.call(collection, function (value) {
					foundEntries.push([value]);
				});
			} catch (notSet) {
				return false;
			}
		}
		return foundEntries;
	};

	module.exports = function whyNotEqual(value, other) {
		if (value === other) { return ''; }
		if (value == null || other == null) {
			return value === other ? '' : String(value) + ' !== ' + String(other);
		}

		var valToStr = toStr.call(value);
		var otherToStr = toStr.call(value);
		if (valToStr !== otherToStr) {
			return 'toStringTag is not the same: ' + valToStr + ' !== ' + otherToStr;
		}

		var valIsBool = isBoolean(value);
		var otherIsBool = isBoolean(other);
		if (valIsBool || otherIsBool) {
			if (!valIsBool) { return 'first argument is not a boolean; second argument is'; }
			if (!otherIsBool) { return 'second argument is not a boolean; first argument is'; }
			var valBoolVal = booleanValue.call(value);
			var otherBoolVal = booleanValue.call(other);
			if (valBoolVal === otherBoolVal) { return ''; }
			return 'primitive value of boolean arguments do not match: ' + valBoolVal + ' !== ' + otherBoolVal;
		}

		var valIsNumber = isNumber(value);
		var otherIsNumber = isNumber(value);
		if (valIsNumber || otherIsNumber) {
			if (!valIsNumber) { return 'first argument is not a number; second argument is'; }
			if (!otherIsNumber) { return 'second argument is not a number; first argument is'; }
			var valNum = Number(value);
			var otherNum = Number(other);
			if (valNum === otherNum) { return ''; }
			var valIsNaN = isNaN(value);
			var otherIsNaN = isNaN(other);
			if (valIsNaN && !otherIsNaN) {
				return 'first argument is NaN; second is not';
			} else if (!valIsNaN && otherIsNaN) {
				return 'second argument is NaN; first is not';
			} else if (valIsNaN && otherIsNaN) {
				return '';
			}
			return 'numbers are different: ' + value + ' !== ' + other;
		}

		var valIsString = isString(value);
		var otherIsString = isString(other);
		if (valIsString || otherIsString) {
			if (!valIsString) { return 'second argument is string; first is not'; }
			if (!otherIsString) { return 'first argument is string; second is not'; }
			var stringVal = String(value);
			var otherVal = String(other);
			if (stringVal === otherVal) { return ''; }
			return 'string values are different: "' + stringVal + '" !== "' + otherVal + '"';
		}

		var valIsDate = isDate(value);
		var otherIsDate = isDate(other);
		if (valIsDate || otherIsDate) {
			if (!valIsDate) { return 'second argument is Date, first is not'; }
			if (!otherIsDate) { return 'first argument is Date, second is not'; }
			var valTime = +value;
			var otherTime = +other;
			if (valTime === otherTime) { return ''; }
			return 'Dates have different time values: ' + valTime + ' !== ' + otherTime;
		}

		var valIsRegex = isRegex(value);
		var otherIsRegex = isRegex(other);
		if (valIsRegex || otherIsRegex) {
			if (!valIsRegex) { return 'second argument is RegExp, first is not'; }
			if (!otherIsRegex) { return 'first argument is RegExp, second is not'; }
			var regexStringVal = String(value);
			var regexStringOther = String(other);
			if (regexStringVal === regexStringOther) { return ''; }
			return 'regular expressions differ: ' + regexStringVal + ' !== ' + regexStringOther;
		}

		var valIsArray = isArray(value);
		var otherIsArray = isArray(other);
		if (valIsArray || otherIsArray) {
			if (!valIsArray) { return 'second argument is an Array, first is not'; }
			if (!otherIsArray) { return 'first argument is an Array, second is not'; }
			if (value.length !== other.length) {
				return 'arrays have different length: ' + value.length + ' !== ' + other.length;
			}
			if (String(value) !== String(other)) { return 'stringified Arrays differ'; }

			var index = value.length - 1;
			var equal = '';
			var valHasIndex, otherHasIndex;
			while (equal === '' && index >= 0) {
				valHasIndex = has(value, index);
				otherHasIndex = has(other, index);
				if (!valHasIndex && otherHasIndex) { return 'second argument has index ' + index + '; first does not'; }
				if (valHasIndex && !otherHasIndex) { return 'first argument has index ' + index + '; second does not'; }
				equal = whyNotEqual(value[index], other[index]);
				index -= 1;
			}
			return equal;
		}

		var valueIsSym = isSymbol(value);
		var otherIsSym = isSymbol(other);
		if (valueIsSym !== otherIsSym) {
			if (valueIsSym) { return 'first argument is Symbol; second is not'; }
			return 'second argument is Symbol; first is not';
		}
		if (valueIsSym && otherIsSym) {
			return symbolValue.call(value) === symbolValue.call(other) ? '' : 'first Symbol value !== second Symbol value';
		}

		var valueIsGen = isGenerator(value);
		var otherIsGen = isGenerator(other);
		if (valueIsGen !== otherIsGen) {
			if (valueIsGen) { return 'first argument is a Generator; second is not'; }
			return 'second argument is a Generator; first is not';
		}

		var valueIsArrow = isArrowFunction(value);
		var otherIsArrow = isArrowFunction(other);
		if (valueIsArrow !== otherIsArrow) {
			if (valueIsArrow) { return 'first argument is an Arrow function; second is not'; }
			return 'second argument is an Arrow function; first is not';
		}

		if (isCallable(value) || isCallable(other)) {
			if (functionsHaveNames && whyNotEqual(value.name, other.name) !== '') {
				return 'Function names differ: "' + value.name + '" !== "' + other.name + '"';
			}
			if (whyNotEqual(value.length, other.length) !== '') {
				return 'Function lengths differ: ' + value.length + ' !== ' + other.length;
			}

			var valueStr = normalizeFnWhitespace(String(value));
			var otherStr = normalizeFnWhitespace(String(other));
			if (whyNotEqual(valueStr, otherStr) === '') { return ''; }

			if (!valueIsGen && !valueIsArrow) {
				return whyNotEqual(valueStr.replace(/\)\s*\{/, '){'), otherStr.replace(/\)\s*\{/, '){')) === '' ? '' : 'Function string representations differ';
			}
			return whyNotEqual(valueStr, otherStr) === '' ? '' : 'Function string representations differ';
		}

		if (typeof value === 'object' || typeof other === 'object') {
			if (typeof value !== typeof other) { return 'arguments have a different typeof: ' + typeof value + ' !== ' + typeof other; }
			if (isProto.call(value, other)) { return 'first argument is the [[Prototype]] of the second'; }
			if (isProto.call(other, value)) { return 'second argument is the [[Prototype]] of the first'; }
			if (getPrototypeOf(value) !== getPrototypeOf(other)) { return 'arguments have a different [[Prototype]]'; }

			if (symbolIterator) {
				var valueIteratorFn = value[symbolIterator];
				var valueIsIterable = isCallable(valueIteratorFn);
				var otherIteratorFn = other[symbolIterator];
				var otherIsIterable = isCallable(otherIteratorFn);
				if (valueIsIterable !== otherIsIterable) {
					if (valueIsIterable) { return 'first argument is iterable; second is not'; }
					return 'second argument is iterable; first is not';
				}
				if (valueIsIterable && otherIsIterable) {
					var valueIterator = valueIteratorFn.call(value);
					var otherIterator = otherIteratorFn.call(other);
					var valueNext, otherNext, nextWhy;
					do {
						valueNext = valueIterator.next();
						otherNext = otherIterator.next();
						if (!valueNext.done && !otherNext.done) {
							nextWhy = whyNotEqual(valueNext, otherNext);
							if (nextWhy !== '') {
								return 'iteration results are not equal: ' + nextWhy;
							}
						}
					} while (!valueNext.done && !otherNext.done);
					if (valueNext.done && !otherNext.done) { return 'first argument finished iterating before second'; }
					if (!valueNext.done && otherNext.done) { return 'second argument finished iterating before first'; }
					return '';
				}
			} else if (collectionsForEach.Map || collectionsForEach.Set) {
				var valueEntries = tryMapSetEntries(value);
				var otherEntries = tryMapSetEntries(other);
				var valueEntriesIsArray = isArray(valueEntries);
				var otherEntriesIsArray = isArray(otherEntries);
				if (valueEntriesIsArray && !otherEntriesIsArray) { return 'first argument has Collection entries, second does not'; }
				if (!valueEntriesIsArray && otherEntriesIsArray) { return 'second argument has Collection entries, first does not'; }
				if (valueEntriesIsArray && otherEntriesIsArray) {
					var entriesWhy = whyNotEqual(valueEntries, otherEntries);
					return entriesWhy === '' ? '' : 'Collection entries differ: ' + entriesWhy;
				}
			}

			var key, valueKeyIsRecursive, otherKeyIsRecursive, keyWhy;
			for (key in value) {
				if (has(value, key)) {
					if (!has(other, key)) { return 'first argument has key "' + key + '"; second does not'; }
					valueKeyIsRecursive = value[key] && value[key][key] === value;
					otherKeyIsRecursive = other[key] && other[key][key] === other;
					if (valueKeyIsRecursive !== otherKeyIsRecursive) {
						if (valueKeyIsRecursive) { return 'first argument has a circular reference at key "' + key + '"; second does not'; }
						return 'second argument has a circular reference at key "' + key + '"; first does not';
					}
					if (!valueKeyIsRecursive && !otherKeyIsRecursive) {
						keyWhy = whyNotEqual(value[key], other[key]);
						if (keyWhy !== '') {
							return 'value at key "' + key + '" differs: ' + keyWhy;
						}
					}
				}
			}
			for (key in other) {
				if (has(other, key) && !has(value, key)) { return 'second argument has key "' + key + '"; first does not'; }
			}
			return '';
		}

		return false;
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var bind = __webpack_require__(9);

	module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var implementation = __webpack_require__(10);

	module.exports = Function.prototype.bind || implementation;


/***/ },
/* 10 */
/***/ function(module, exports) {

	var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
	var slice = Array.prototype.slice;
	var toStr = Object.prototype.toString;
	var funcType = '[object Function]';

	module.exports = function bind(that) {
	    var target = this;
	    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
	        throw new TypeError(ERROR_MESSAGE + target);
	    }
	    var args = slice.call(arguments, 1);

	    var bound;
	    var binder = function () {
	        if (this instanceof bound) {
	            var result = target.apply(
	                this,
	                args.concat(slice.call(arguments))
	            );
	            if (Object(result) === result) {
	                return result;
	            }
	            return this;
	        } else {
	            return target.apply(
	                that,
	                args.concat(slice.call(arguments))
	            );
	        }
	    };

	    var boundLength = Math.max(0, target.length - args.length);
	    var boundArgs = [];
	    for (var i = 0; i < boundLength; i++) {
	        boundArgs.push('$' + i);
	    }

	    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

	    if (target.prototype) {
	        var Empty = function Empty() {};
	        Empty.prototype = target.prototype;
	        bound.prototype = new Empty();
	        Empty.prototype = null;
	    }

	    return bound;
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var isCallable = __webpack_require__(12);
	var fnToStr = Function.prototype.toString;
	var isNonArrowFnRegex = /^\s*function/;
	var isArrowFnWithParensRegex = /^\([^\)]*\) *=>/;
	var isArrowFnWithoutParensRegex = /^[^=]*=>/;

	module.exports = function isArrowFunction(fn) {
		if (!isCallable(fn)) { return false; }
		var fnStr = fnToStr.call(fn);
		return fnStr.length > 0 &&
			!isNonArrowFnRegex.test(fnStr) &&
			(isArrowFnWithParensRegex.test(fnStr) || isArrowFnWithoutParensRegex.test(fnStr));
	};


/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict';

	var fnToStr = Function.prototype.toString;

	var constructorRegex = /^\s*class /;
	var isES6ClassFn = function isES6ClassFn(value) {
		try {
			var fnStr = fnToStr.call(value);
			var singleStripped = fnStr.replace(/\/\/.*\n/g, '');
			var multiStripped = singleStripped.replace(/\/\*[.\s\S]*\*\//g, '');
			var spaceStripped = multiStripped.replace(/\n/mg, ' ').replace(/ {2}/g, ' ');
			return constructorRegex.test(spaceStripped);
		} catch (e) {
			return false; // not a function
		}
	};

	var tryFunctionObject = function tryFunctionObject(value) {
		try {
			if (isES6ClassFn(value)) { return false; }
			fnToStr.call(value);
			return true;
		} catch (e) {
			return false;
		}
	};
	var toStr = Object.prototype.toString;
	var fnClass = '[object Function]';
	var genClass = '[object GeneratorFunction]';
	var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

	module.exports = function isCallable(value) {
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		if (hasToStringTag) { return tryFunctionObject(value); }
		if (isES6ClassFn(value)) { return false; }
		var strClass = toStr.call(value);
		return strClass === fnClass || strClass === genClass;
	};


/***/ },
/* 13 */
/***/ function(module, exports) {

	'use strict';

	var boolToStr = Boolean.prototype.toString;

	var tryBooleanObject = function tryBooleanObject(value) {
		try {
			boolToStr.call(value);
			return true;
		} catch (e) {
			return false;
		}
	};
	var toStr = Object.prototype.toString;
	var boolClass = '[object Boolean]';
	var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

	module.exports = function isBoolean(value) {
		if (typeof value === 'boolean') { return true; }
		if (typeof value !== 'object') { return false; }
		return hasToStringTag ? tryBooleanObject(value) : toStr.call(value) === boolClass;
	};


/***/ },
/* 14 */
/***/ function(module, exports) {

	'use strict';

	var getDay = Date.prototype.getDay;
	var tryDateObject = function tryDateObject(value) {
		try {
			getDay.call(value);
			return true;
		} catch (e) {
			return false;
		}
	};

	var toStr = Object.prototype.toString;
	var dateClass = '[object Date]';
	var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

	module.exports = function isDateObject(value) {
		if (typeof value !== 'object' || value === null) { return false; }
		return hasToStringTag ? tryDateObject(value) : toStr.call(value) === dateClass;
	};


/***/ },
/* 15 */
/***/ function(module, exports) {

	'use strict';

	var toStr = Object.prototype.toString;
	var fnToStr = Function.prototype.toString;
	var isFnRegex = /^\s*function\*/;

	module.exports = function isGeneratorFunction(fn) {
		if (typeof fn !== 'function') { return false; }
		var fnStr = toStr.call(fn);
		return (fnStr === '[object Function]' || fnStr === '[object GeneratorFunction]') && isFnRegex.test(fnToStr.call(fn));
	};



/***/ },
/* 16 */
/***/ function(module, exports) {

	'use strict';

	var numToStr = Number.prototype.toString;
	var tryNumberObject = function tryNumberObject(value) {
		try {
			numToStr.call(value);
			return true;
		} catch (e) {
			return false;
		}
	};
	var toStr = Object.prototype.toString;
	var numClass = '[object Number]';
	var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

	module.exports = function isNumberObject(value) {
		if (typeof value === 'number') { return true; }
		if (typeof value !== 'object') { return false; }
		return hasToStringTag ? tryNumberObject(value) : toStr.call(value) === numClass;
	};


/***/ },
/* 17 */
/***/ function(module, exports) {

	'use strict';

	var regexExec = RegExp.prototype.exec;
	var tryRegexExec = function tryRegexExec(value) {
		try {
			regexExec.call(value);
			return true;
		} catch (e) {
			return false;
		}
	};
	var toStr = Object.prototype.toString;
	var regexClass = '[object RegExp]';
	var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

	module.exports = function isRegex(value) {
		if (typeof value !== 'object') { return false; }
		return hasToStringTag ? tryRegexExec(value) : toStr.call(value) === regexClass;
	};


/***/ },
/* 18 */
/***/ function(module, exports) {

	'use strict';

	var strValue = String.prototype.valueOf;
	var tryStringObject = function tryStringObject(value) {
		try {
			strValue.call(value);
			return true;
		} catch (e) {
			return false;
		}
	};
	var toStr = Object.prototype.toString;
	var strClass = '[object String]';
	var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

	module.exports = function isString(value) {
		if (typeof value === 'string') { return true; }
		if (typeof value !== 'object') { return false; }
		return hasToStringTag ? tryStringObject(value) : toStr.call(value) === strClass;
	};


/***/ },
/* 19 */
/***/ function(module, exports) {

	'use strict';

	var toStr = Object.prototype.toString;
	var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

	if (hasSymbols) {
		var symToStr = Symbol.prototype.toString;
		var symStringRegex = /^Symbol\(.*\)$/;
		var isSymbolObject = function isSymbolObject(value) {
			if (typeof value.valueOf() !== 'symbol') { return false; }
			return symStringRegex.test(symToStr.call(value));
		};
		module.exports = function isSymbol(value) {
			if (typeof value === 'symbol') { return true; }
			if (toStr.call(value) !== '[object Symbol]') { return false; }
			try {
				return isSymbolObject(value);
			} catch (e) {
				return false;
			}
		};
	} else {
		module.exports = function isSymbol(value) {
			// this environment does not support Symbols.
			return false;
		};
	}


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var isSymbol = __webpack_require__(19);

	module.exports = function getSymbolIterator() {
		var symbolIterator = typeof Symbol === 'function' && isSymbol(Symbol.iterator) ? Symbol.iterator : null;

		if (typeof Object.getOwnPropertyNames === 'function' && typeof Map === 'function' && typeof Map.prototype.entries === 'function') {
			Object.getOwnPropertyNames(Map.prototype).forEach(function (name) {
				if (name !== 'entries' && name !== 'size' && Map.prototype[name] === Map.prototype.entries) {
					symbolIterator = name;
				}
			});
		}

		return symbolIterator;
	};


/***/ },
/* 21 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		var mapForEach = (function () {
			if (typeof Map !== 'function') { return null; }
			try {
				Map.prototype.forEach.call({}, function () {});
			} catch (e) {
				return Map.prototype.forEach;
			}
			return null;
		}());

		var setForEach = (function () {
			if (typeof Set !== 'function') { return null; }
			try {
				Set.prototype.forEach.call({}, function () {});
			} catch (e) {
				return Set.prototype.forEach;
			}
			return null;
		}());

		return { Map: mapForEach, Set: setForEach };
	};


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _objectInspect = __webpack_require__(23);

	var _objectInspect2 = _interopRequireDefault(_objectInspect);

	function assert(condition, messageFormat) {
	  for (var _len = arguments.length, extraArgs = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	    extraArgs[_key - 2] = arguments[_key];
	  }

	  if (condition) return;

	  var index = 0;

	  throw new Error(messageFormat.replace(/%s/g, function () {
	    return _objectInspect2['default'](extraArgs[index++]);
	  }));
	}

	exports['default'] = assert;
	module.exports = exports['default'];

/***/ },
/* 23 */
/***/ function(module, exports) {

	var hasMap = typeof Map === 'function' && Map.prototype;
	var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, 'size') : null;
	var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === 'function' ? mapSizeDescriptor.get : null;
	var mapForEach = hasMap && Map.prototype.forEach;
	var hasSet = typeof Set === 'function' && Set.prototype;
	var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, 'size') : null;
	var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === 'function' ? setSizeDescriptor.get : null;
	var setForEach = hasSet && Set.prototype.forEach;

	module.exports = function inspect_ (obj, opts, depth, seen) {
	    if (!opts) opts = {};
	    
	    var maxDepth = opts.depth === undefined ? 5 : opts.depth;
	    if (depth === undefined) depth = 0;
	    if (depth >= maxDepth && maxDepth > 0
	    && obj && typeof obj === 'object') {
	        return '[Object]';
	    }
	    
	    if (seen === undefined) seen = [];
	    else if (indexOf(seen, obj) >= 0) {
	        return '[Circular]';
	    }
	    
	    function inspect (value, from) {
	        if (from) {
	            seen = seen.slice();
	            seen.push(from);
	        }
	        return inspect_(value, opts, depth + 1, seen);
	    }
	    
	    if (typeof obj === 'string') {
	        return inspectString(obj);
	    }
	    else if (typeof obj === 'function') {
	        var name = nameOf(obj);
	        return '[Function' + (name ? ': ' + name : '') + ']';
	    }
	    else if (obj === null) {
	        return 'null';
	    }
	    else if (isSymbol(obj)) {
	        var symString = Symbol.prototype.toString.call(obj);
	        return typeof obj === 'object' ? 'Object(' + symString + ')' : symString;
	    }
	    else if (isElement(obj)) {
	        var s = '<' + String(obj.nodeName).toLowerCase();
	        var attrs = obj.attributes || [];
	        for (var i = 0; i < attrs.length; i++) {
	            s += ' ' + attrs[i].name + '="' + quote(attrs[i].value) + '"';
	        }
	        s += '>';
	        if (obj.childNodes && obj.childNodes.length) s += '...';
	        s += '</' + String(obj.nodeName).toLowerCase() + '>';
	        return s;
	    }
	    else if (isArray(obj)) {
	        if (obj.length === 0) return '[]';
	        var xs = Array(obj.length);
	        for (var i = 0; i < obj.length; i++) {
	            xs[i] = has(obj, i) ? inspect(obj[i], obj) : '';
	        }
	        return '[ ' + xs.join(', ') + ' ]';
	    }
	    else if (isError(obj)) {
	        var parts = [];
	        for (var key in obj) {
	            if (!has(obj, key)) continue;
	            
	            if (/[^\w$]/.test(key)) {
	                parts.push(inspect(key) + ': ' + inspect(obj[key]));
	            }
	            else {
	                parts.push(key + ': ' + inspect(obj[key]));
	            }
	        }
	        if (parts.length === 0) return '[' + obj + ']';
	        return '{ [' + obj + '] ' + parts.join(', ') + ' }';
	    }
	    else if (typeof obj === 'object' && typeof obj.inspect === 'function') {
	        return obj.inspect();
	    }
	    else if (isMap(obj)) {
	        var parts = [];
	        mapForEach.call(obj, function (value, key) {
	            parts.push(inspect(key, obj) + ' => ' + inspect(value, obj));
	        });
	        return 'Map (' + mapSize.call(obj) + ') {' + parts.join(', ') + '}';
	    }
	    else if (isSet(obj)) {
	        var parts = [];
	        setForEach.call(obj, function (value ) {
	            parts.push(inspect(value, obj));
	        });
	        return 'Set (' + setSize.call(obj) + ') {' + parts.join(', ') + '}';
	    }
	    else if (typeof obj === 'object' && !isDate(obj) && !isRegExp(obj)) {
	        var xs = [], keys = [];
	        for (var key in obj) {
	            if (has(obj, key)) keys.push(key);
	        }
	        keys.sort();
	        for (var i = 0; i < keys.length; i++) {
	            var key = keys[i];
	            if (/[^\w$]/.test(key)) {
	                xs.push(inspect(key) + ': ' + inspect(obj[key], obj));
	            }
	            else xs.push(key + ': ' + inspect(obj[key], obj));
	        }
	        if (xs.length === 0) return '{}';
	        return '{ ' + xs.join(', ') + ' }';
	    }
	    else return String(obj);
	};

	function quote (s) {
	    return String(s).replace(/"/g, '&quot;');
	}

	function isArray (obj) { return toStr(obj) === '[object Array]' }
	function isDate (obj) { return toStr(obj) === '[object Date]' }
	function isRegExp (obj) { return toStr(obj) === '[object RegExp]' }
	function isError (obj) { return toStr(obj) === '[object Error]' }
	function isSymbol (obj) { return toStr(obj) === '[object Symbol]' }

	var hasOwn = Object.prototype.hasOwnProperty || function (key) { return key in this; };
	function has (obj, key) {
	    return hasOwn.call(obj, key);
	}

	function toStr (obj) {
	    return Object.prototype.toString.call(obj);
	}

	function nameOf (f) {
	    if (f.name) return f.name;
	    var m = f.toString().match(/^function\s*([\w$]+)/);
	    if (m) return m[1];
	}

	function indexOf (xs, x) {
	    if (xs.indexOf) return xs.indexOf(x);
	    for (var i = 0, l = xs.length; i < l; i++) {
	        if (xs[i] === x) return i;
	    }
	    return -1;
	}

	function isMap (x) {
	    if (!mapSize) {
	        return false;
	    }
	    try {
	        mapSize.call(x);
	        return true;
	    } catch (e) {}
	    return false;
	}

	function isSet (x) {
	    if (!setSize) {
	        return false;
	    }
	    try {
	        setSize.call(x);
	        return true;
	    } catch (e) {}
	    return false;
	}

	function isElement (x) {
	    if (!x || typeof x !== 'object') return false;
	    if (typeof HTMLElement !== 'undefined' && x instanceof HTMLElement) {
	        return true;
	    }
	    return typeof x.nodeName === 'string'
	        && typeof x.getAttribute === 'function'
	    ;
	}

	function inspectString (str) {
	    var s = str.replace(/(['\\])/g, '\\$1').replace(/[\x00-\x1f]/g, lowbyte);
	    return "'" + s + "'";
	    
	    function lowbyte (c) {
	        var n = c.charCodeAt(0);
	        var x = { 8: 'b', 9: 't', 10: 'n', 12: 'f', 13: 'r' }[n];
	        if (x) return '\\' + x;
	        return '\\x' + (n < 0x10 ? '0' : '') + n.toString(16);
	    }
	}


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.createSpy = createSpy;
	exports.spyOn = spyOn;
	exports.isSpy = isSpy;
	exports.restoreSpies = restoreSpies;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _assert = __webpack_require__(22);

	var _assert2 = _interopRequireDefault(_assert);

	var _TestUtils = __webpack_require__(25);

	function noop() {}

	var spies = [];

	function createSpy(fn) {
	  var restore = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

	  if (fn == null) fn = noop;

	  _assert2['default'](_TestUtils.isFunction(fn), 'createSpy needs a function');

	  var targetFn = undefined,
	      thrownValue = undefined,
	      returnValue = undefined;

	  var spy = function spy() {
	    spy.calls.push({
	      context: this,
	      arguments: Array.prototype.slice.call(arguments, 0)
	    });

	    if (targetFn) return targetFn.apply(this, arguments);

	    if (thrownValue) throw thrownValue;

	    return returnValue;
	  };

	  spy.calls = [];

	  spy.andCall = function (fn) {
	    targetFn = fn;
	    return spy;
	  };

	  spy.andCallThrough = function () {
	    return spy.andCall(fn);
	  };

	  spy.andThrow = function (object) {
	    thrownValue = object;
	    return spy;
	  };

	  spy.andReturn = function (value) {
	    returnValue = value;
	    return spy;
	  };

	  spy.getLastCall = function () {
	    return spy.calls[spy.calls.length - 1];
	  };

	  spy.reset = function () {
	    spy.calls = [];
	  };

	  spy.restore = spy.destroy = restore;

	  spy.__isSpy = true;

	  spies.push(spy);

	  return spy;
	}

	function spyOn(object, methodName) {
	  var original = object[methodName];

	  if (!isSpy(original)) {
	    _assert2['default'](_TestUtils.isFunction(original), 'Cannot spyOn the %s property; it is not a function', methodName);

	    object[methodName] = createSpy(original, function () {
	      object[methodName] = original;
	    });
	  }

	  return object[methodName];
	}

	function isSpy(object) {
	  return object && object.__isSpy === true;
	}

	function restoreSpies() {
	  for (var i = spies.length - 1; i >= 0; i--) {
	    spies[i].restore();
	  }spies = [];
	}

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.functionThrows = functionThrows;
	exports.arrayContains = arrayContains;
	exports.stringContains = stringContains;
	exports.isArray = isArray;
	exports.isFunction = isFunction;
	exports.isA = isA;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _isEqual = __webpack_require__(6);

	var _isEqual2 = _interopRequireDefault(_isEqual);

	var _isRegex = __webpack_require__(17);

	var _isRegex2 = _interopRequireDefault(_isRegex);

	/**
	 * Returns true if the given function throws the given value
	 * when invoked. The value may be:
	 *
	 * - undefined, to merely assert there was a throw
	 * - a constructor function, for comparing using instanceof
	 * - a regular expression, to compare with the error message
	 * - a string, to find in the error message
	 */

	function functionThrows(fn, context, args, value) {
	  try {
	    fn.apply(context, args);
	  } catch (error) {
	    if (value == null) return true;

	    if (isFunction(value) && error instanceof value) return true;

	    var message = error.message || error;

	    if (typeof message === 'string') {
	      if (_isRegex2['default'](value) && value.test(error.message)) return true;

	      if (typeof value === 'string' && message.indexOf(value) !== -1) return true;
	    }
	  }

	  return false;
	}

	/**
	 * Returns true if the given array contains the value, false
	 * otherwise. The compareValues function must return false to
	 * indicate a non-match.
	 */

	function arrayContains(array, value, compareValues) {
	  if (compareValues == null) compareValues = _isEqual2['default'];

	  return array.some(function (item) {
	    return compareValues(item, value) !== false;
	  });
	}

	/**
	 * Returns true if the given string contains the value, false otherwise.
	 */

	function stringContains(string, value) {
	  return string.indexOf(value) !== -1;
	}

	/**
	 * Returns true if the given object is an array.
	 */

	function isArray(object) {
	  return Array.isArray(object);
	}

	/**
	 * Returns true if the given object is a function.
	 */

	function isFunction(object) {
	  return typeof object === 'function';
	}

	/**
	 * Returns true if the given object is an instanceof value
	 * or its typeof is the given value.
	 */

	function isA(object, value) {
	  if (isFunction(value)) return object instanceof value;

	  if (value === 'array') return Array.isArray(object);

	  return typeof object === value;
	}

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _Expectation = __webpack_require__(5);

	var _Expectation2 = _interopRequireDefault(_Expectation);

	var Extensions = [];

	function extend(extension) {
	  if (Extensions.indexOf(extension) === -1) {
	    Extensions.push(extension);

	    for (var p in extension) {
	      if (extension.hasOwnProperty(p)) _Expectation2['default'].prototype[p] = extension[p];
	    }
	  }
	}

	exports['default'] = extend;
	module.exports = exports['default'];

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	exports.__esModule = true;
	exports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineReducers = exports.createStore = undefined;

	var _createStore = __webpack_require__(29);

	var _createStore2 = _interopRequireDefault(_createStore);

	var _combineReducers = __webpack_require__(33);

	var _combineReducers2 = _interopRequireDefault(_combineReducers);

	var _bindActionCreators = __webpack_require__(35);

	var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);

	var _applyMiddleware = __webpack_require__(36);

	var _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);

	var _compose = __webpack_require__(37);

	var _compose2 = _interopRequireDefault(_compose);

	var _warning = __webpack_require__(34);

	var _warning2 = _interopRequireDefault(_warning);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	/*
	* This is a dummy function to check if the function name has been altered by minification.
	* If the function has been minified and NODE_ENV !== 'production', warn the user.
	*/
	function isCrushed() {}

	if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
	  (0, _warning2["default"])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
	}

	exports.createStore = _createStore2["default"];
	exports.combineReducers = _combineReducers2["default"];
	exports.bindActionCreators = _bindActionCreators2["default"];
	exports.applyMiddleware = _applyMiddleware2["default"];
	exports.compose = _compose2["default"];
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(28)))

/***/ },
/* 28 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.ActionTypes = undefined;
	exports["default"] = createStore;

	var _isPlainObject = __webpack_require__(30);

	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	/**
	 * These are private action types reserved by Redux.
	 * For any unknown actions, you must return the current state.
	 * If the current state is undefined, you must return the initial state.
	 * Do not reference these action types directly in your code.
	 */
	var ActionTypes = exports.ActionTypes = {
	  INIT: '@@redux/INIT'
	};

	/**
	 * Creates a Redux store that holds the state tree.
	 * The only way to change the data in the store is to call `dispatch()` on it.
	 *
	 * There should only be a single store in your app. To specify how different
	 * parts of the state tree respond to actions, you may combine several reducers
	 * into a single reducer function by using `combineReducers`.
	 *
	 * @param {Function} reducer A function that returns the next state tree, given
	 * the current state tree and the action to handle.
	 *
	 * @param {any} [initialState] The initial state. You may optionally specify it
	 * to hydrate the state from the server in universal apps, or to restore a
	 * previously serialized user session.
	 * If you use `combineReducers` to produce the root reducer function, this must be
	 * an object with the same shape as `combineReducers` keys.
	 *
	 * @param {Function} enhancer The store enhancer. You may optionally specify it
	 * to enhance the store with third-party capabilities such as middleware,
	 * time travel, persistence, etc. The only store enhancer that ships with Redux
	 * is `applyMiddleware()`.
	 *
	 * @returns {Store} A Redux store that lets you read the state, dispatch actions
	 * and subscribe to changes.
	 */
	function createStore(reducer, initialState, enhancer) {
	  if (typeof initialState === 'function' && typeof enhancer === 'undefined') {
	    enhancer = initialState;
	    initialState = undefined;
	  }

	  if (typeof enhancer !== 'undefined') {
	    if (typeof enhancer !== 'function') {
	      throw new Error('Expected the enhancer to be a function.');
	    }

	    return enhancer(createStore)(reducer, initialState);
	  }

	  if (typeof reducer !== 'function') {
	    throw new Error('Expected the reducer to be a function.');
	  }

	  var currentReducer = reducer;
	  var currentState = initialState;
	  var currentListeners = [];
	  var nextListeners = currentListeners;
	  var isDispatching = false;

	  function ensureCanMutateNextListeners() {
	    if (nextListeners === currentListeners) {
	      nextListeners = currentListeners.slice();
	    }
	  }

	  /**
	   * Reads the state tree managed by the store.
	   *
	   * @returns {any} The current state tree of your application.
	   */
	  function getState() {
	    return currentState;
	  }

	  /**
	   * Adds a change listener. It will be called any time an action is dispatched,
	   * and some part of the state tree may potentially have changed. You may then
	   * call `getState()` to read the current state tree inside the callback.
	   *
	   * You may call `dispatch()` from a change listener, with the following
	   * caveats:
	   *
	   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
	   * If you subscribe or unsubscribe while the listeners are being invoked, this
	   * will not have any effect on the `dispatch()` that is currently in progress.
	   * However, the next `dispatch()` call, whether nested or not, will use a more
	   * recent snapshot of the subscription list.
	   *
	   * 2. The listener should not expect to see all states changes, as the state
	   * might have been updated multiple times during a nested `dispatch()` before
	   * the listener is called. It is, however, guaranteed that all subscribers
	   * registered before the `dispatch()` started will be called with the latest
	   * state by the time it exits.
	   *
	   * @param {Function} listener A callback to be invoked on every dispatch.
	   * @returns {Function} A function to remove this change listener.
	   */
	  function subscribe(listener) {
	    if (typeof listener !== 'function') {
	      throw new Error('Expected listener to be a function.');
	    }

	    var isSubscribed = true;

	    ensureCanMutateNextListeners();
	    nextListeners.push(listener);

	    return function unsubscribe() {
	      if (!isSubscribed) {
	        return;
	      }

	      isSubscribed = false;

	      ensureCanMutateNextListeners();
	      var index = nextListeners.indexOf(listener);
	      nextListeners.splice(index, 1);
	    };
	  }

	  /**
	   * Dispatches an action. It is the only way to trigger a state change.
	   *
	   * The `reducer` function, used to create the store, will be called with the
	   * current state tree and the given `action`. Its return value will
	   * be considered the **next** state of the tree, and the change listeners
	   * will be notified.
	   *
	   * The base implementation only supports plain object actions. If you want to
	   * dispatch a Promise, an Observable, a thunk, or something else, you need to
	   * wrap your store creating function into the corresponding middleware. For
	   * example, see the documentation for the `redux-thunk` package. Even the
	   * middleware will eventually dispatch plain object actions using this method.
	   *
	   * @param {Object} action A plain object representing “what changed”. It is
	   * a good idea to keep actions serializable so you can record and replay user
	   * sessions, or use the time travelling `redux-devtools`. An action must have
	   * a `type` property which may not be `undefined`. It is a good idea to use
	   * string constants for action types.
	   *
	   * @returns {Object} For convenience, the same action object you dispatched.
	   *
	   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
	   * return something else (for example, a Promise you can await).
	   */
	  function dispatch(action) {
	    if (!(0, _isPlainObject2["default"])(action)) {
	      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
	    }

	    if (typeof action.type === 'undefined') {
	      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
	    }

	    if (isDispatching) {
	      throw new Error('Reducers may not dispatch actions.');
	    }

	    try {
	      isDispatching = true;
	      currentState = currentReducer(currentState, action);
	    } finally {
	      isDispatching = false;
	    }

	    var listeners = currentListeners = nextListeners;
	    for (var i = 0; i < listeners.length; i++) {
	      listeners[i]();
	    }

	    return action;
	  }

	  /**
	   * Replaces the reducer currently used by the store to calculate the state.
	   *
	   * You might need this if your app implements code splitting and you want to
	   * load some of the reducers dynamically. You might also need this if you
	   * implement a hot reloading mechanism for Redux.
	   *
	   * @param {Function} nextReducer The reducer for the store to use instead.
	   * @returns {void}
	   */
	  function replaceReducer(nextReducer) {
	    if (typeof nextReducer !== 'function') {
	      throw new Error('Expected the nextReducer to be a function.');
	    }

	    currentReducer = nextReducer;
	    dispatch({ type: ActionTypes.INIT });
	  }

	  // When a store is created, an "INIT" action is dispatched so that every
	  // reducer returns their initial state. This effectively populates
	  // the initial state tree.
	  dispatch({ type: ActionTypes.INIT });

	  return {
	    dispatch: dispatch,
	    subscribe: subscribe,
	    getState: getState,
	    replaceReducer: replaceReducer
	  };
	}

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var isHostObject = __webpack_require__(31),
	    isObjectLike = __webpack_require__(32);

	/** `Object#toString` result references. */
	var objectTag = '[object Object]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;

	/** Used to infer the `Object` constructor. */
	var objectCtorString = funcToString.call(Object);

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Built-in value references. */
	var getPrototypeOf = Object.getPrototypeOf;

	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */
	function isPlainObject(value) {
	  if (!isObjectLike(value) ||
	      objectToString.call(value) != objectTag || isHostObject(value)) {
	    return false;
	  }
	  var proto = getPrototypeOf(value);
	  if (proto === null) {
	    return true;
	  }
	  var Ctor = proto.constructor;
	  return (typeof Ctor == 'function' &&
	    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
	}

	module.exports = isPlainObject;


/***/ },
/* 31 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}

	module.exports = isHostObject;


/***/ },
/* 32 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	module.exports = isObjectLike;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	exports.__esModule = true;
	exports["default"] = combineReducers;

	var _createStore = __webpack_require__(29);

	var _isPlainObject = __webpack_require__(30);

	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

	var _warning = __webpack_require__(34);

	var _warning2 = _interopRequireDefault(_warning);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function getUndefinedStateErrorMessage(key, action) {
	  var actionType = action && action.type;
	  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';

	  return 'Reducer "' + key + '" returned undefined handling ' + actionName + '. ' + 'To ignore an action, you must explicitly return the previous state.';
	}

	function getUnexpectedStateShapeWarningMessage(inputState, reducers, action) {
	  var reducerKeys = Object.keys(reducers);
	  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'initialState argument passed to createStore' : 'previous state received by the reducer';

	  if (reducerKeys.length === 0) {
	    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
	  }

	  if (!(0, _isPlainObject2["default"])(inputState)) {
	    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
	  }

	  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
	    return !reducers.hasOwnProperty(key);
	  });

	  if (unexpectedKeys.length > 0) {
	    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
	  }
	}

	function assertReducerSanity(reducers) {
	  Object.keys(reducers).forEach(function (key) {
	    var reducer = reducers[key];
	    var initialState = reducer(undefined, { type: _createStore.ActionTypes.INIT });

	    if (typeof initialState === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
	    }

	    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
	    if (typeof reducer(undefined, { type: type }) === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
	    }
	  });
	}

	/**
	 * Turns an object whose values are different reducer functions, into a single
	 * reducer function. It will call every child reducer, and gather their results
	 * into a single state object, whose keys correspond to the keys of the passed
	 * reducer functions.
	 *
	 * @param {Object} reducers An object whose values correspond to different
	 * reducer functions that need to be combined into one. One handy way to obtain
	 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
	 * undefined for any action. Instead, they should return their initial state
	 * if the state passed to them was undefined, and the current state for any
	 * unrecognized action.
	 *
	 * @returns {Function} A reducer function that invokes every reducer inside the
	 * passed object, and builds a state object with the same shape.
	 */
	function combineReducers(reducers) {
	  var reducerKeys = Object.keys(reducers);
	  var finalReducers = {};
	  for (var i = 0; i < reducerKeys.length; i++) {
	    var key = reducerKeys[i];
	    if (typeof reducers[key] === 'function') {
	      finalReducers[key] = reducers[key];
	    }
	  }
	  var finalReducerKeys = Object.keys(finalReducers);

	  var sanityError;
	  try {
	    assertReducerSanity(finalReducers);
	  } catch (e) {
	    sanityError = e;
	  }

	  return function combination() {
	    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	    var action = arguments[1];

	    if (sanityError) {
	      throw sanityError;
	    }

	    if (process.env.NODE_ENV !== 'production') {
	      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action);
	      if (warningMessage) {
	        (0, _warning2["default"])(warningMessage);
	      }
	    }

	    var hasChanged = false;
	    var nextState = {};
	    for (var i = 0; i < finalReducerKeys.length; i++) {
	      var key = finalReducerKeys[i];
	      var reducer = finalReducers[key];
	      var previousStateForKey = state[key];
	      var nextStateForKey = reducer(previousStateForKey, action);
	      if (typeof nextStateForKey === 'undefined') {
	        var errorMessage = getUndefinedStateErrorMessage(key, action);
	        throw new Error(errorMessage);
	      }
	      nextState[key] = nextStateForKey;
	      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
	    }
	    return hasChanged ? nextState : state;
	  };
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(28)))

/***/ },
/* 34 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports["default"] = warning;
	/**
	 * Prints a warning in the console if it exists.
	 *
	 * @param {String} message The warning message.
	 * @returns {void}
	 */
	function warning(message) {
	  /* eslint-disable no-console */
	  if (typeof console !== 'undefined' && typeof console.error === 'function') {
	    console.error(message);
	  }
	  /* eslint-enable no-console */
	  try {
	    // This error was thrown as a convenience so that you can use this stack
	    // to find the callsite that caused this warning to fire.
	    throw new Error(message);
	    /* eslint-disable no-empty */
	  } catch (e) {}
	  /* eslint-enable no-empty */
	}

/***/ },
/* 35 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports["default"] = bindActionCreators;
	function bindActionCreator(actionCreator, dispatch) {
	  return function () {
	    return dispatch(actionCreator.apply(undefined, arguments));
	  };
	}

	/**
	 * Turns an object whose values are action creators, into an object with the
	 * same keys, but with every function wrapped into a `dispatch` call so they
	 * may be invoked directly. This is just a convenience method, as you can call
	 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
	 *
	 * For convenience, you can also pass a single function as the first argument,
	 * and get a function in return.
	 *
	 * @param {Function|Object} actionCreators An object whose values are action
	 * creator functions. One handy way to obtain it is to use ES6 `import * as`
	 * syntax. You may also pass a single function.
	 *
	 * @param {Function} dispatch The `dispatch` function available on your Redux
	 * store.
	 *
	 * @returns {Function|Object} The object mimicking the original object, but with
	 * every action creator wrapped into the `dispatch` call. If you passed a
	 * function as `actionCreators`, the return value will also be a single
	 * function.
	 */
	function bindActionCreators(actionCreators, dispatch) {
	  if (typeof actionCreators === 'function') {
	    return bindActionCreator(actionCreators, dispatch);
	  }

	  if (typeof actionCreators !== 'object' || actionCreators === null) {
	    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
	  }

	  var keys = Object.keys(actionCreators);
	  var boundActionCreators = {};
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    var actionCreator = actionCreators[key];
	    if (typeof actionCreator === 'function') {
	      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
	    }
	  }
	  return boundActionCreators;
	}

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	exports.__esModule = true;
	exports["default"] = applyMiddleware;

	var _compose = __webpack_require__(37);

	var _compose2 = _interopRequireDefault(_compose);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	/**
	 * Creates a store enhancer that applies middleware to the dispatch method
	 * of the Redux store. This is handy for a variety of tasks, such as expressing
	 * asynchronous actions in a concise manner, or logging every action payload.
	 *
	 * See `redux-thunk` package as an example of the Redux middleware.
	 *
	 * Because middleware is potentially asynchronous, this should be the first
	 * store enhancer in the composition chain.
	 *
	 * Note that each middleware will be given the `dispatch` and `getState` functions
	 * as named arguments.
	 *
	 * @param {...Function} middlewares The middleware chain to be applied.
	 * @returns {Function} A store enhancer applying the middleware.
	 */
	function applyMiddleware() {
	  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
	    middlewares[_key] = arguments[_key];
	  }

	  return function (createStore) {
	    return function (reducer, initialState, enhancer) {
	      var store = createStore(reducer, initialState, enhancer);
	      var _dispatch = store.dispatch;
	      var chain = [];

	      var middlewareAPI = {
	        getState: store.getState,
	        dispatch: function dispatch(action) {
	          return _dispatch(action);
	        }
	      };
	      chain = middlewares.map(function (middleware) {
	        return middleware(middlewareAPI);
	      });
	      _dispatch = _compose2["default"].apply(undefined, chain)(store.dispatch);

	      return _extends({}, store, {
	        dispatch: _dispatch
	      });
	    };
	  };
	}

/***/ },
/* 37 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;
	exports["default"] = compose;
	/**
	 * Composes single-argument functions from right to left.
	 *
	 * @param {...Function} funcs The functions to compose.
	 * @returns {Function} A function obtained by composing functions from right to
	 * left. For example, compose(f, g, h) is identical to arg => f(g(h(arg))).
	 */
	function compose() {
	  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
	    funcs[_key] = arguments[_key];
	  }

	  return function () {
	    if (funcs.length === 0) {
	      return arguments.length <= 0 ? undefined : arguments[0];
	    }

	    var last = funcs[funcs.length - 1];
	    var rest = funcs.slice(0, -1);

	    return rest.reduceRight(function (composed, f) {
	      return f(composed);
	    }, last.apply(undefined, arguments));
	  };
	}

/***/ },
/* 38 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = thunkMiddleware;
	function thunkMiddleware(_ref) {
	  var dispatch = _ref.dispatch;
	  var getState = _ref.getState;

	  return function (next) {
	    return function (action) {
	      if (typeof action === 'function') {
	        return action(dispatch, getState);
	      }

	      return next(action);
	    };
	  };
	}

/***/ },
/* 39 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var REQUEST_STOCK = exports.REQUEST_STOCK = 'REQUEST_STOCK';
	var RECIEVE_STOCK = exports.RECIEVE_STOCK = 'RECIEVE_STOCK';
	var INVALID_SYMBOL = exports.INVALID_SYMBOL = 'INVALID_SYMBOL';
	var BAD_SYMBOL = exports.BAD_SYMBOL = 'BAD_SYMBOL';
	var INIT_STOCK = exports.INIT_STOCK = 'INIT_STOCK';
	var BUY_STOCK = exports.BUY_STOCK = 'BUY_STOCK';
	var SELL_STOCK = exports.SELL_STOCK = 'SELL_STOCK';

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.SELL_STOCK = exports.BUY_STOCK = exports.INIT_STOCK = exports.BAD_SYMBOL = exports.INVALID_SYMBOL = exports.RECEIVE_STOCK = exports.REQUEST_STOCK = undefined;
	exports.requestStock = requestStock;
	exports.receiveStock = receiveStock;
	exports.invalidSymbol = invalidSymbol;
	exports.badSymbol = badSymbol;
	exports.getStock = getStock;
	exports.buyStock = buyStock;
	exports.sellStock = sellStock;

	var _isomorphicFetch = __webpack_require__(41);

	var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var REQUEST_STOCK = exports.REQUEST_STOCK = 'REQUEST_STOCK';
	function requestStock(symbol) {
	  return {
	    type: 'REQUEST_STOCK',
	    symbol: symbol
	  };
	}

	var RECEIVE_STOCK = exports.RECEIVE_STOCK = 'RECIEVE_STOCK';
	function receiveStock(symbol, json) {
	  return {
	    type: RECEIVE_STOCK,
	    symbol: symbol,
	    bid: json.data[symbol].bidPrice,
	    ask: json.data[symbol].askPrice
	  };
	}

	var INVALID_SYMBOL = exports.INVALID_SYMBOL = 'INVALID_SYMBOL';

	function invalidSymbol(symbol) {
	  return {
	    type: INVALID_SYMBOL,
	    symbol: symbol
	  };
	}

	var BAD_SYMBOL = exports.BAD_SYMBOL = 'BAD_SYMBOL';

	function badSymbol(message) {
	  return {
	    type: BAD_SYMBOL,
	    message: message
	  };
	}

	function getStock(symbol) {

	  return function (dispatch) {

	    dispatch(requestStock(symbol));

	    return (0, _isomorphicFetch2.default)('http://careers-data.benzinga.com/rest/richquote?symbols=' + symbol).then(function (response) {
	      if (response.status >= 400) {
	        dispatch(invalidSymbol(symbol));
	        throw new Error("Bad response");
	      }
	      return response.json();
	    }).then(function (json) {
	      if (json[symbol].error) {
	        dispatch(badSymbol(json[symbol].error.message));
	      } else {
	        dispatch(recieveStock(symbol, json));
	        //dispatch(initStock(symbol, json))
	      }
	    });
	  };
	}

	var INIT_STOCK = exports.INIT_STOCK = 'INIT_STOCK';

	function initStock(symbol, json) {
	  return {
	    type: INIT_STOCK,
	    symbol: symbol,
	    bid: json.data[symbol].bidPrice,
	    ask: json.data[symbol].askPrice
	  };
	}

	var BUY_STOCK = exports.BUY_STOCK = 'BUY_STOCK';

	function buyStock(symbol, amt) {
	  return {
	    type: BUY_STOCK,
	    symbol: symbol,
	    amt: amt
	  };
	}

	var SELL_STOCK = exports.SELL_STOCK = 'SELL_STOCK';

	function sellStock(symbol, amt) {
	  return {
	    type: SELL_STOCK,
	    symbol: symbol,
	    amt: amt
	  };
	}

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	// the whatwg-fetch polyfill installs the fetch() function
	// on the global object (window or self)
	//
	// Return that as the export for use in Webpack, Browserify etc.
	__webpack_require__(42);
	module.exports = self.fetch.bind(self);


/***/ },
/* 42 */
/***/ function(module, exports) {

	(function(self) {
	  'use strict';

	  if (self.fetch) {
	    return
	  }

	  function normalizeName(name) {
	    if (typeof name !== 'string') {
	      name = String(name)
	    }
	    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
	      throw new TypeError('Invalid character in header field name')
	    }
	    return name.toLowerCase()
	  }

	  function normalizeValue(value) {
	    if (typeof value !== 'string') {
	      value = String(value)
	    }
	    return value
	  }

	  function Headers(headers) {
	    this.map = {}

	    if (headers instanceof Headers) {
	      headers.forEach(function(value, name) {
	        this.append(name, value)
	      }, this)

	    } else if (headers) {
	      Object.getOwnPropertyNames(headers).forEach(function(name) {
	        this.append(name, headers[name])
	      }, this)
	    }
	  }

	  Headers.prototype.append = function(name, value) {
	    name = normalizeName(name)
	    value = normalizeValue(value)
	    var list = this.map[name]
	    if (!list) {
	      list = []
	      this.map[name] = list
	    }
	    list.push(value)
	  }

	  Headers.prototype['delete'] = function(name) {
	    delete this.map[normalizeName(name)]
	  }

	  Headers.prototype.get = function(name) {
	    var values = this.map[normalizeName(name)]
	    return values ? values[0] : null
	  }

	  Headers.prototype.getAll = function(name) {
	    return this.map[normalizeName(name)] || []
	  }

	  Headers.prototype.has = function(name) {
	    return this.map.hasOwnProperty(normalizeName(name))
	  }

	  Headers.prototype.set = function(name, value) {
	    this.map[normalizeName(name)] = [normalizeValue(value)]
	  }

	  Headers.prototype.forEach = function(callback, thisArg) {
	    Object.getOwnPropertyNames(this.map).forEach(function(name) {
	      this.map[name].forEach(function(value) {
	        callback.call(thisArg, value, name, this)
	      }, this)
	    }, this)
	  }

	  function consumed(body) {
	    if (body.bodyUsed) {
	      return Promise.reject(new TypeError('Already read'))
	    }
	    body.bodyUsed = true
	  }

	  function fileReaderReady(reader) {
	    return new Promise(function(resolve, reject) {
	      reader.onload = function() {
	        resolve(reader.result)
	      }
	      reader.onerror = function() {
	        reject(reader.error)
	      }
	    })
	  }

	  function readBlobAsArrayBuffer(blob) {
	    var reader = new FileReader()
	    reader.readAsArrayBuffer(blob)
	    return fileReaderReady(reader)
	  }

	  function readBlobAsText(blob) {
	    var reader = new FileReader()
	    reader.readAsText(blob)
	    return fileReaderReady(reader)
	  }

	  var support = {
	    blob: 'FileReader' in self && 'Blob' in self && (function() {
	      try {
	        new Blob();
	        return true
	      } catch(e) {
	        return false
	      }
	    })(),
	    formData: 'FormData' in self,
	    arrayBuffer: 'ArrayBuffer' in self
	  }

	  function Body() {
	    this.bodyUsed = false


	    this._initBody = function(body) {
	      this._bodyInit = body
	      if (typeof body === 'string') {
	        this._bodyText = body
	      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	        this._bodyBlob = body
	      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	        this._bodyFormData = body
	      } else if (!body) {
	        this._bodyText = ''
	      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
	        // Only support ArrayBuffers for POST method.
	        // Receiving ArrayBuffers happens via Blobs, instead.
	      } else {
	        throw new Error('unsupported BodyInit type')
	      }

	      if (!this.headers.get('content-type')) {
	        if (typeof body === 'string') {
	          this.headers.set('content-type', 'text/plain;charset=UTF-8')
	        } else if (this._bodyBlob && this._bodyBlob.type) {
	          this.headers.set('content-type', this._bodyBlob.type)
	        }
	      }
	    }

	    if (support.blob) {
	      this.blob = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }

	        if (this._bodyBlob) {
	          return Promise.resolve(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as blob')
	        } else {
	          return Promise.resolve(new Blob([this._bodyText]))
	        }
	      }

	      this.arrayBuffer = function() {
	        return this.blob().then(readBlobAsArrayBuffer)
	      }

	      this.text = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }

	        if (this._bodyBlob) {
	          return readBlobAsText(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as text')
	        } else {
	          return Promise.resolve(this._bodyText)
	        }
	      }
	    } else {
	      this.text = function() {
	        var rejected = consumed(this)
	        return rejected ? rejected : Promise.resolve(this._bodyText)
	      }
	    }

	    if (support.formData) {
	      this.formData = function() {
	        return this.text().then(decode)
	      }
	    }

	    this.json = function() {
	      return this.text().then(JSON.parse)
	    }

	    return this
	  }

	  // HTTP methods whose capitalization should be normalized
	  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

	  function normalizeMethod(method) {
	    var upcased = method.toUpperCase()
	    return (methods.indexOf(upcased) > -1) ? upcased : method
	  }

	  function Request(input, options) {
	    options = options || {}
	    var body = options.body
	    if (Request.prototype.isPrototypeOf(input)) {
	      if (input.bodyUsed) {
	        throw new TypeError('Already read')
	      }
	      this.url = input.url
	      this.credentials = input.credentials
	      if (!options.headers) {
	        this.headers = new Headers(input.headers)
	      }
	      this.method = input.method
	      this.mode = input.mode
	      if (!body) {
	        body = input._bodyInit
	        input.bodyUsed = true
	      }
	    } else {
	      this.url = input
	    }

	    this.credentials = options.credentials || this.credentials || 'omit'
	    if (options.headers || !this.headers) {
	      this.headers = new Headers(options.headers)
	    }
	    this.method = normalizeMethod(options.method || this.method || 'GET')
	    this.mode = options.mode || this.mode || null
	    this.referrer = null

	    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
	      throw new TypeError('Body not allowed for GET or HEAD requests')
	    }
	    this._initBody(body)
	  }

	  Request.prototype.clone = function() {
	    return new Request(this)
	  }

	  function decode(body) {
	    var form = new FormData()
	    body.trim().split('&').forEach(function(bytes) {
	      if (bytes) {
	        var split = bytes.split('=')
	        var name = split.shift().replace(/\+/g, ' ')
	        var value = split.join('=').replace(/\+/g, ' ')
	        form.append(decodeURIComponent(name), decodeURIComponent(value))
	      }
	    })
	    return form
	  }

	  function headers(xhr) {
	    var head = new Headers()
	    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
	    pairs.forEach(function(header) {
	      var split = header.trim().split(':')
	      var key = split.shift().trim()
	      var value = split.join(':').trim()
	      head.append(key, value)
	    })
	    return head
	  }

	  Body.call(Request.prototype)

	  function Response(bodyInit, options) {
	    if (!options) {
	      options = {}
	    }

	    this.type = 'default'
	    this.status = options.status
	    this.ok = this.status >= 200 && this.status < 300
	    this.statusText = options.statusText
	    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
	    this.url = options.url || ''
	    this._initBody(bodyInit)
	  }

	  Body.call(Response.prototype)

	  Response.prototype.clone = function() {
	    return new Response(this._bodyInit, {
	      status: this.status,
	      statusText: this.statusText,
	      headers: new Headers(this.headers),
	      url: this.url
	    })
	  }

	  Response.error = function() {
	    var response = new Response(null, {status: 0, statusText: ''})
	    response.type = 'error'
	    return response
	  }

	  var redirectStatuses = [301, 302, 303, 307, 308]

	  Response.redirect = function(url, status) {
	    if (redirectStatuses.indexOf(status) === -1) {
	      throw new RangeError('Invalid status code')
	    }

	    return new Response(null, {status: status, headers: {location: url}})
	  }

	  self.Headers = Headers;
	  self.Request = Request;
	  self.Response = Response;

	  self.fetch = function(input, init) {
	    return new Promise(function(resolve, reject) {
	      var request
	      if (Request.prototype.isPrototypeOf(input) && !init) {
	        request = input
	      } else {
	        request = new Request(input, init)
	      }

	      var xhr = new XMLHttpRequest()

	      function responseURL() {
	        if ('responseURL' in xhr) {
	          return xhr.responseURL
	        }

	        // Avoid security warnings on getResponseHeader when not allowed by CORS
	        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
	          return xhr.getResponseHeader('X-Request-URL')
	        }

	        return;
	      }

	      xhr.onload = function() {
	        var status = (xhr.status === 1223) ? 204 : xhr.status
	        if (status < 100 || status > 599) {
	          reject(new TypeError('Network request failed'))
	          return
	        }
	        var options = {
	          status: status,
	          statusText: xhr.statusText,
	          headers: headers(xhr),
	          url: responseURL()
	        }
	        var body = 'response' in xhr ? xhr.response : xhr.responseText;
	        resolve(new Response(body, options))
	      }

	      xhr.onerror = function() {
	        reject(new TypeError('Network request failed'))
	      }

	      xhr.open(request.method, request.url, true)

	      if (request.credentials === 'include') {
	        xhr.withCredentials = true
	      }

	      if ('responseType' in xhr && support.blob) {
	        xhr.responseType = 'blob'
	      }

	      request.headers.forEach(function(value, name) {
	        xhr.setRequestHeader(name, value)
	      })

	      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
	    })
	  }
	  self.fetch.polyfill = true
	})(typeof self !== 'undefined' ? self : this);


/***/ }
/******/ ]);