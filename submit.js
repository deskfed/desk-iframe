desk.ready(function() {
  var inact = desk.interaction;
  var cti = inact.cti;
  var keyeify = function(acc, pair, idx, arr) {
    acc[pair.name] = pair.value;
    return acc;
  };

  var $dialed = $('#number-dialied');

  var dispatchMap = {
    'height-form': function(params) {
      $(document.body).css('height', params.height)
      cti.setSoftphoneHeight(params.height);
    },
    'width-form': function(params) {
      $(document.body).css('width', params.width)
      cti.setSoftphoneWidth(params.width);
    },
    'search-form': function(params) {
      inact.searchAndScreenPop(params['search-value'], {
        objectType: params['search-objectType'],
        channel: 'phone'
      });
    }
  };

  var onFormSubmit = function(e) {
    e.preventDefault();
    var $form = $(this);
    var params = $form.serializeArray().reduce(keyeify, {});
    dispatchMap[$form.attr('id')](params);
  };

  cti.onClickToDial(function(params) {
    $dialed.val(params.phoneNum);
  });

  cti.setSoftphoneWidth(300);

  $('form').on('submit', onFormSubmit);
});
