$(function(){
  var filterPrefix = localStorage.getItem('filterPrefix'), filterTimeout, domTimeout, totalCount, tddiumNotifier_active = true;
  var hide = function(jqEvent){
    if ( ! filterPrefix || ! tddiumNotifier_active ) { return };

    totalCount = $('.suites tbody > tr:visible').length;
    requestAnimationFrame(function(timestamp){
      $('.suites tbody > tr:visible').map(function(n, el){ if ( !$(el).find(':contains('+ filterPrefix + ')').length) { return el } }).hide();
    });
  };

  hide();

  // activate and deactivate hiding
  // determined by whether or not the tab is active
  chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
    switch(request) {
      case "activate":
        tddiumNotifier_active = true;
        hide();
        break;
      case "deactivate":
        tddiumNotifier_active = false;
        break;
      default:
        console.log( "we're not expecting other messages" )
    }
  });

  $('.archived-notice').after('<div><label for="tddium-filter">Filter:</label><input name="tddium_filter" id="tddium-filter" placeholder="type in your filter"/></div>');

  // hide the branches that don't match
  $('#tddium-filter').on('keyup', function(){
    filterTimeout = setTimeout(function(){
     if ( filterTimeout ) {
       clearTimeout( filterTimeout );
     }
     filterPrefix = $('#tddium-filter').val();
     localStorage.setItem('filterPrefix', filterPrefix );
     $('.suites tbody > tr').show();
     hide();
    }, 300);
     
  }).val( filterPrefix || '');

  // Tddium is really DOM update happy
  $('.suites tbody').on('DOMNodeInserted', function( jqEvent ) {
    hide();
  });
});
