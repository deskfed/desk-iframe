// NOTE: this library only supports IE10+
// we have these as params so that they can be minified/uglified
(function(window, document, undefined) {
  var VERSION = 1.0;
  var ctrPrefix = new Date();
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

  var EVENTS_MAP = {
    CONNECT: 'connect'
  };

  var OUTBOUND_METHOD_MAP = {
    SET_SOFTPHONE_HEIGHT: 'setSoftphoneHeight',
    SET_SOFTPHONE_WIDTH: 'setSoftphoneWidth',
    SCREEN_POP: 'screenPop',
    SEARCH_AND_SCREEN_POP: 'searchAndScreenPop'
  };

  var INBOUND_METHOD_MAP = {
    ON_CLICK_TO_DIAL: 'onClickToDial'
  };

  var listeners = {};

  var ObjProto = Object.prototype;
  var ArrProto = Array.prototype;
  var FunProto = Function.prototype;

  var toString = FunProto.call.bind(ObjProto.toString);
  var slice = FunProto.call.bind(ArrProto.slice);

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
      queue = (listeners[params.method] || (listeners[params.method] = []))
      queue.push(cb);
    }
    // because of the IE10+ support we can just use
    // the "structured clone algorithm" instead of having to
    // stringify our data structure into JSON
    window.parent.postMessage(params, '*');
  }

  function parseQueryParams() {
  }

  function onMessage(e) {
    if (e.data.method === 'clickToDial') {
      var queue = listeners[INBOUND_METHOD_MAP.ON_CLICK_TO_DIAL];

      if (typeOf(queue) === 'array') {
        queue.forEach(function(cb) {
          cb(e.data);
        });
      }
    }
  }

  // following salesforce api where methods to interaction with the
  // api are attached to `interaction`
  var inact = desk.interaction = {};
  var cti = inact.cti = {};

  // public api
  // String -> Int -> String -> ()
  inact.screenPop = function(id, objectType, cb) {
    postMessage({
      method: OUTBOUND_METHOD_MAP.SCREEN_POP,
      id: id,
      objectType: objectType
    }, cb);
  };

  // String -> Int -> Object -> ()
  inact.searchAndScreenPop = function(searchString, queryParams, cb) {
    postMessage({
      method: OUTBOUND_METHOD_MAP.SEARCH_AND_SCREEN_POP,
      searchString: searchString,
      queryParams: queryParams
    }, cb);
  };

  // String -> Int -> ()
  cti.setSoftphoneHeight = function(height, cb) {
    postMessage({
      method: OUTBOUND_METHOD_MAP.SET_SOFTPHONE_HEIGHT,
      height: height
    }, cb);
  };

  // String -> Int -> ()
  cti.setSoftphoneWidth = function(width, cb) {
    postMessage({
      method: OUTBOUND_METHOD_MAP.SET_SOFTPHONE_WIDTH,
      width: width
    }, cb);
  };

  cti.enableClickToDial = function() {

  };

  cti.disableClickToDial =  function() {

  };

  cti.onClickToDial = function(cb) {
    postMessage({
      method: INBOUND_METHOD_MAP.ON_CLICK_TO_DIAL
    }, cb);
  };
}(window, document));
