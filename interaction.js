// we have these as params so that they can be minified/uglified
(function(window, document, undefined) {
  var domReady = false;
  var scriptReady = false;
  var prevDesk = window.desk;
  var desk = window.desk = {};
  desk.readyQueue = [];

  // this implementation allows us to load the actual library asynchronously
  // sort of like using `<script defer src='url'>`
  var script = document.createElement('script');
  script.async = true;
  script.src = 'deskcti.js';
  var anchor = document.getElementsByTagName('script')[0];
  anchor.parentNode.insertBefore(script, anchor);

  function onDomLoad() {
    document.removeEventListener('DOMContentLoaded', onDomLoad);
    window.removeEventListener('load', onDomLoad);
    domReady = true;
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
      if (typeof readyItem === 'function') {
        readyItem();
      }
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

  document.addEventListener('DOMContentLoaded', onDomLoad, false);
  window.addEventListener('load', onDomLoad, false);
  script.onload = onScriptReady;
}(window, document));
