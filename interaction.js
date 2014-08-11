// we have these as params so that they can be minified/uglified
(function(window, document, undefined) {
  var domReady = false;
  var scriptReady = false;
  var prevDesk = window.desk;
  var desk = window.desk = {};
  desk.readyQueue = [];

  // this implementation allows us to load the actual library asynchronously
  // sort of like using `<script async src='url'>`
  var script = document.createElement('script');
  script.async = true;
  // NOTE: these links are temporary until we get a place to host the actual file
  if (!!~window.location.hostname.indexOf('localhost')) {
    script.src = 'deskcti.js';
  } else {
    script.src = '//desksoftphone.herokuapp.com/deskcti.js';
  }
  var anchor = document.getElementsByTagName('script')[0];
  anchor.parentNode.insertBefore(script, anchor);

  function onDomLoad() {
    domReady = true;
    document.removeEventListener('DOMContentLoaded', onDomLoad);
    window.removeEventListener('load', onDomLoad);
    init();
  }

  function onScriptReady() {
    scriptReady = true;
    script.onload = null;
    init();
  }

  function init() {
    var readyItem;
    // We want to make sure that the dom is ready and the async script
    // library has been loaded before running the readyQueue
    if (!domReady || !scriptReady) {
      return;
    }
    while ((readyItem = desk.readyQueue.shift())) {
      readyItem();
    }
  }

  desk.ready = function(fn) {
    desk.readyQueue.push(fn);
    init();
  };

  desk.noConflict = function() {
    window.desk = prevDesk;
    return desk;
  };

  // use the load event as a fallback in case the `DOMContentLoaded` event
  // is not supported
  document.addEventListener('DOMContentLoaded', onDomLoad, false);
  window.addEventListener('load', onDomLoad, false);
  // make sure we also wait for the async script to be loaded
  script.onload = onScriptReady;
}(window, document));
