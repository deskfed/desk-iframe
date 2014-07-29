// NOTE: this library only supports IE10+
// we have these as params so that they can be minified/uglified
(function(window, document, undefined) {
  var VERSION = 1.0;
  var ctrPrefix = new Date().valueOf();
  var postMsgCtr = 0;
  var desk = window.desk = window.desk || {};
  desk.VERSION = VERSION;
  window.addEventListener('message', onMessage, false);

  var TYPE_MAP = {
    '[object String]': 'string',
    '[object Number]': 'number',
    '[object Date]': 'date',
    '[object Array]': 'array',
    '[object Boolean]': 'boolean',
    '[object Function]': 'function',
    '[object RegExp]': 'regexp',
    '[object Null]': 'null',
    '[object Undefined]': 'undefined'
  };

  var EVENT_MAP = {
    CONNECT: 'connect'
  };

  var CALLBACK_LISTENERS = ['clickToDial'];

  var listeners = {};

  var ObjProto = Object.prototype;
  var ArrProto = Array.prototype;
  var FunProto = Function.prototype;
  var call = FunProto.call;

  // turn these object oriented functions into pure functions
  // to make them easier to call. ex:
  // [].slice(arguments)
  // Array.prototype.slice(arguments)
  // vs
  // slice(arguments)
  var keys = Object.keys;
  var toString = call.bind(ObjProto.toString);
  var slice = call.bind(ArrProto.slice);

  var compose = desk.compose = function() {
    return slice(arguments).reverse().reduce(function(prev, cur) {
      return function() {
        return cur(prev.apply(null, slice(arguments)));
      };
    });
  };

  var typeOf = desk.typeOf = function(item) {
    return TYPE_MAP[toString(item)];
  };

  var extend = desk.extend = function(target) {
    slice(arguments, 1).forEach(function(source) {
      var key;
      if (source) {
        for (key in source) {
          target[key] = source[key];
        }
      }
    });
    return target;
  }

  function postMessageId() {
    return ctrPrefix + postMsgCtr++;
  }

  function postMessage(params, cb) {
    var queue;
    // alow coercion :)
    if (cb != null) {
      queue = (listeners[params.method] || (listeners[params.method] = []));
      queue.push(cb);
    }
    // because of the IE10+ support we can just use
    // the "structured clone algorithm" instead of having to
    // stringify our data structure into JSON
    window.parent.postMessage(params, '*');
  }

  function postMessageDecorator(obj, method) {
    var decorator = (function(method, pair) {
      var params = pair[0];
      var cb = pair[1];
      params = extend(params, { postMsgId: postMessageId(), method: method });
      postMessage.call(null, params, cb);
    }).bind(null, method);
    obj[method] = compose(decorator, obj[method]);
  }

  function parseQueryString(queryString) {
    var params = {};
    // TODO: improve this
    if (typeOf(queryString) !== 'string') {
      return params;
    }
    if (queryString.charAt(0) === '?') {
      queryString = queryString.slice(1);
    }
    if (queryString.length === 0) {
      return params;
    }

    var pairs = queryString.split('&');
    return pairs.reduce(function(params, pair) {
      var pair = pair.split('=');
      params[pair[0]] = !!pair[1] ? window.decodeUriComponent(pair[1]) : null;
      return params;
    }, params);
  }

  function parseAuthParams() {

  }

  function onMessage(e) {
    console.log(e);
    var data = e.data;
    if (!data.method) {
      return;
    }
    var method = data.method.charAt(0).toUpperCase() + data.method.slice(1);
    var queue = listeners['on' + method];
    if (!queue) {
      return;
    }
    if (typeOf(queue) === 'array') {
      queue.forEach(function(cb) {
        cb(e.data);
      });
    }
  }

  // follow salesforce api where interaction and cti both expose methods
  var inact = desk.interaction = {};
  var cti = inact.cti = {};

  // public api
  inact.screenPop = function(id, objectType, cb) {
    return [{ id: id, objectType: objectType }, cb];
  };

  inact.searchAndScreenPop = function(searchString, queryParams, cb) {
    return [{ searchString: searchString, queryParams: queryParams }, cb];
  };

  cti.setSoftphoneHeight = function(height, cb) {
    return [{ height: height }, cb];
  };

  cti.setSoftphoneWidth = function(width, cb) {
    return [{ width: width }, cb];
  };

  cti.enableClickToDial = function(cb) {
    return [{}, cb];
  };

  cti.disableClickToDial =  function(cb) {
    return [{}, cb];
  };

  cti.onClickToDial = function(cb) {
    return [{}, cb];
  };

  keys(inact)
    .filter(function(key) { return key !== 'cti'; })
    .forEach(postMessageDecorator.bind(null, inact));
  keys(cti).forEach(postMessageDecorator.bind(null, cti));
}(window, document));
