// NOTE: this library only supports IE10+
// we have these as params so that they can be minified/uglified
(function(window, document, undefined) {
  var VERSION = '0.0.1';
  var desk = window.desk = window.desk || {};
  desk.VERSION = VERSION;
  var ctr = 0;
  var ctrPrefix = new Date().valueOf();
  var frameToken = null;
  var frameOrigin = null;

  // follow salesforce api where interaction and cti both expose methods
  var inact = desk.interaction = {};
  var cti = inact.cti = {};
  var feed = inact.entityFeed = {};

  // list of unimplemented methods as of salesforce interaction version 31.0
  var unimplementedInteractionMethods = [
    'isInConsole',
    'searchAndGetScreenPopUrl',
    'getPageInfo',
    'onFocus',
    'saveLog',
    'runApex',
    'setVisible',
    'isVisible',
    'refreshPage',
    'refreshRelatedList'
  ];
  var unimplementedCtiMethods = [
    'getCallCenterSettings',
    'getSoftphoneLayout',
    'notifyInitializationComplete',
    'getDirectoryNumbers'
  ];
  var unimplementedEntityFeedMethods = [
    'refreshObject',
    'onObjectUpdate'
  ];

  // ******************************
  //          Utilities
  // ******************************

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

  var CALLBACK_LISTENERS = {
    onClickToDial: 'onClickToDial'
  };

  var callbacks = {};

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
  var noop = function() {};
  var log = noop;

  if (window.console && window.console.log) {
    log = function() {
      window.console.log.apply(window.console, arguments);
    };
  }

  function getId() {
    return ctrPrefix + ctr++;
  }

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

  function decode(string) {
    return window.decodeURIComponent(string || '').replace('+', ' ');
  }

  function parseQueryString(queryString) {
    var args = queryString.split('&');
    return args.reduce(function(params, pair) {
      var pair, key, value;
      pair = pair.split('=');
      key = decode(pair[0]);
      value = decode(pair[1]);
      params[key] = value;
      return params;
    }, {});
  }

  function assignNoop(obj, key) {
    obj[key] = noop;
  }

  // ******************************
  //         private api
  // ******************************
  function initialize(search) {
    var inactIgnoreProps = { cti: null, entityFeed: null };

    window.addEventListener('message', onMessage, false);

    unimplementedInteractionMethods.forEach(assignNoop.bind(null, inact));
    unimplementedCtiMethods.forEach(assignNoop.bind(null, cti));
    unimplementedEntityFeedMethods.forEach(assignNoop.bind(null, feed));

    keys(inact)
      .filter(function(key) { return !(key in inactIgnoreProps); })
      .forEach(postMessageDecorator.bind(null, inact));
    keys(cti).forEach(postMessageDecorator.bind(null, cti));
    keys(feed).forEach(postMessageDecorator.bind(null, feed));

    search = search.replace(/^\?/, '');
    var params = parseQueryString(search);
    frameToken = params.token || null;
    frameOrigin = params.frameOrigin || null;
  }

  function postMessage(data) {
    if (frameOrigin) {
      // because of the IE10+ support we can just use
      // the "structured clone algorithm" instead of having to
      // stringify our data structure into JSON
      window.parent.postMessage(data, frameOrigin);
    }
  }

  function registerCallback(method, cb) {
    // there are two types of callbacks, one is the listener which we can
    // can just queue up in an array. while the other one is really a
    // success/failure callback which is associated to a specific method
    // invocation so we need to give it a unique id.
    if (method in CALLBACK_LISTENERS) {
      (callbacks[method] || (callbacks[method] = [])).push(cb);
      return method;
    }
    method += '_' + getId();
    callbacks[method] = [cb];
    return method;
  }

  function postMessageDecorator(obj, method) {
    var decorator = (function(method, pair) {
      if (!pair) {
        pair = [{}, null];
      }
      var data = pair[0];
      var cb = pair[1];
      data = extend(data, {
        method: method,
        apiVersion: VERSION,
        token: frameToken
      });
      if (typeOf(cb) === 'function') {
        data.callbackId = registerCallback(data.method, cb);
      }
      postMessage.call(null, data, cb);
    }).bind(null, method);
    obj[method] = compose(decorator, obj[method]);
  }

  function onMessage(e) {
    console.log('on message in iframe', e);
    var origin, data;
    try {
      origin = e.origin;
      data = e.data;
      // it could be possible that the postMessage isnt meant for us
      // even though the origin is correct so dont even bother.
      if (data && data.__postTarget === 'interaction') {
        if (!frameOrigin || origin !== frameOrigin || !data.callbackId) {
          return;
        }
        executeCallbacks(data, data.callbackId);
      }
    } catch (err) {
      log('failed to process message:', err.message);
    }
  }

  function executeCallbacks(data, callbackId) {
    var inCallbackListeners = callbackId in CALLBACK_LISTENERS;
    var queue = callbacks[callbackId];
    if (!queue || !queue.length || typeOf(queue) !== 'array') {
      return;
    }
    var params = {};
    params.result = data.result;
    params.error = data.error;
    queue.forEach(function(cb) {
      cb(params);
    });
    if (!inCallbackListeners) {
      callbacks[callbackId].length = 0;
      delete callbacks[callbackId];
    }
  }

  // ******************************
  //          public api
  // ******************************
  inact.screenPop = function(id, queryParams, cb) {
    return [{ id: id, queryString: queryParams}, cb];
  };

  inact.searchAndScreenPop = function(searchString, queryParams, cb) {
    return [{ searchString: searchString, queryParams: queryParams}, cb];
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

  initialize(window.location.search);
}(window, document));
