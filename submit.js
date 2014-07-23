desk.ready(function() {
  var onFormSubmit, keyeify;
  keyeify = function(acc, pair, idx, arr) {
    acc[pair.name] = pair.value;
    return acc;
  };
  onFormSubmit = function(e) {
    var $form, form;
    e.preventDefault();
    $form = $(this);
    form = $form.serializeArray().reduce(keyeify, {});
    var cti = desk.interaction.cti;
    $(document.body).css({ height: form.height, width: form.width });
    cti.setSoftphoneHeight(form.height);
    cti.setSoftphoneWidth(form.width);
  };

  $('#main-form').on('submit', onFormSubmit);
});
