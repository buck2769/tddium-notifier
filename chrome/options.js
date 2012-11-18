$(function(){
  $('#branch_pattern').val( localStorage.getItem('branchPattern') || '' );
  $('form').submit(function(){
    var branchPattern = $('#branch_pattern').val().trim(),
      backgroundPage = chrome.extension.getBackgroundPage();
    localStorage.setItem('branchPattern',  branchPattern);
    localStorage.removeItem('branches');
    localStorage.setItem('refreshTime', $('#refresh_time').val().trim());
    // TODO: run the fetchStatus with the new branchPattern
    $('.container').append(
      '<div class="alert alert-success fade in">' +
      '<button type="button" class="close" data-dismiss="alert">x</button>' +
      '<span>' + branchPattern + ' was saved.</span></div>'
    );
    setTimeout(function(){
      $('.container .alert:contains(' + branchPattern +')').alert('close');
    }, 3000);

    backgroundPage.updateFeaturePrefix();
    backgroundPage.updateDisplays();

    return false;
  });
});
