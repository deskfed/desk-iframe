desk.ready(function() {
  var inact = desk.interaction;
  var cti = inact.cti;
  var keyeify = function(acc, pair, idx, arr) {
    acc[pair.name] = pair.value;
    return acc;
  };

  function respCallback(method, resp) {
    if (resp.result) {
      console.log(method, 'success', resp.result);
    } else {
      console.log(method, 'error', resp.error);
    }
  }

  var $dialed = $('#number-dialed');

  var dispatchMap = {
    'height-form': function(params) {
      $(document.body).css('height', params.height)
      cti.setSoftphoneHeight(params.height, respCallback.bind(null, 'set height'));
    },
    'width-form': function(params) {
      $(document.body).css('width', params.width)
      cti.setSoftphoneWidth(params.width, respCallback.bind(null, 'set width'));
    },
    'pop-to-form': function(params) {
      inact.screenPop(params['pop-value'],
        'object=' + window.encodeURIComponent(params['pop-object']),
        respCallback.bind(null, 'screen pop')
      );
    },
    'search-form': function(params) {
      inact.searchAndScreenPop(params['search-value'],
        'object=' + window.encodeURIComponent(params['search-object']),
        respCallback.bind(null, 'search and screen pop')
      );
    },
    'click-to-dial-form': function(params) {
      if (params && params['click-to-dial'] === 'on') {
        cti.enableClickToDial(respCallback.bind(null, 'enable click to dial'));
      } else {
        cti.disableClickToDial(respCallback.bind(null, 'disable click to dial'));
      }
    }
  };

  var onFormSubmit = function(e) {
    e.preventDefault();
    var $form = $(this);
    var params = $form.serializeArray().reduce(keyeify, {});
    dispatchMap[$form.attr('id')](params);
  };

  cti.onClickToDial(function(resp) {
    console.log('onClickToDial');
    $dialed.val(resp.result.number);
  });

  cti.setSoftphoneWidth(300, respCallback.bind(null, 'origin width set'));
  cti.enableClickToDial(respCallback.bind(null, 'enable click to dial'));

  $('form').on('submit', onFormSubmit);
});
