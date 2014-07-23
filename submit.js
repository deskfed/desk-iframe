desk.ready(function() {
  var onFormSubmit, keyeify, eventMap;
  var inact = desk.interaction;
  var cti = inact.cti;
  keyeify = function(acc, pair, idx, arr) {
    acc[pair.name] = pair.value;
    return acc;
  };

  dispatchMap = {
    'height-form': function(params) {
      $(document.body).css('height', params.height)
      cti.setSoftphoneHeight(params.height);
    },
    'width-form': function(params) {
      $(document.body).css('width', params.width)
      cti.setSoftphoneWidth(params.width);
    },
    'screen-pop': function(params) {
      inact.screenPop(params['screenPop-id'], params['screenPop-objectType']);
    },
    'search-and-screen-pop': function(params) {
      inact.searchAndScreenPop(params['searchAndScreenPop-searchString'], {
        channel: 'phone'
      });
    }
  };

  onFormSubmit = function(e) {
    var $form, params;
    e.preventDefault();
    $form = $(this);
    params = $form.serializeArray().reduce(keyeify, {});
    dispatchMap[$form.attr('id')](params);
  };

  $('form').on('submit', onFormSubmit);
});
