// NOTE: this library only supports IE10+
// we have these as params so that they can be minified/uglified
(function(window, document, undefined) {
  var VERSION = 1.0;
  var desk = window.desk = window.desk || {};
  var TYPE_MAP = {
    '[object String]': 'string',
    '[object Number]': 'number',
    '[object Date]': 'date',
    '[object Boolean]': 'boolean',
    '[object Function]': 'function',
    '[object RegExp]': 'regexp',
    '[object Null]': 'null',
    '[object Undefined]': 'undefined'
  };
  desk.VERSION = VERSION;

  var METHOD = {
    SET_SOFTPHONE_HEIGHT: 'setSoftphoneHeight',
    SET_SOFTPHONE_WIDTH: 'setSoftphoneWidth',
    SCREEN_POP: 'screenPop',
    SEARCH_AND_SCREEN_POP: 'searchAndScreenPop'
  };

  var toString = Object.prototype.toString;

  /*
   *
   */
  var typeOf = desk.typeOf = function(item) {
    return TYPE_MAP[toString.call(item)];
  };

  function postMessage(params, cb) {
    // because of the IE10+ support we can just use
    // the "structured clone algorithm" instead of having to
    // stringify our data structure into JSON
    window.parent.postMessage(params, '*');
  }

  function parseQueryParams() {
  }

  // following salesforce api where methods to interaction with the
  // api are attached to `interaction`
  var inact = desk.interaction = {};
  var cti = inact.cti = {};

  // public api
  // String -> Int -> String -> ()
  inact.screenPop = function(id, objectType, cb) {
    postMessage({ method: METHOD.SCREEN_POP, id: id, objectType: objectType }, cb);
  };

  // String -> Int -> Object -> ()
  inact.searchAndScreenPop = function(searchString, queryParams, cb) {
    postMessage({
      method: METHOD.SEARCH_AND_SCREEN_POP,
      searchString: searchString,
      queryParams: queryParams
    }, cb);
  };

  // String -> Int -> ()
  cti.setSoftphoneHeight = function(height, cb) {
    postMessage({ method: METHOD.SET_SOFTPHONE_HEIGHT, height: height }, cb);
  };

  // String -> Int -> ()
  cti.setSoftphoneWidth = function(width, cb) {
    postMessage({ method: METHOD.SET_SOFTPHONE_WIDTH, width: width }, cb);
  };

  cti.enableClickToDial = function(nonce) {

  };

  cti.disableClickToDial =  function(nonce) {

  };

  cti.onClickToDial = function(nonce, fn) {

  };
}(window, document));
