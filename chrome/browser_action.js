$(function(){
  var $messages = $('<ul></ul>')
    , backgroundPage = chrome.extension.getBackgroundPage()
    , branches = backgroundPage.getBranches();
  $('.messages').html('').append($messages);

  branches = _.values( branches ).sort(function(a, b) {
    if (! a.lastBuildTime ) { return true; }
    if (! b.lastBuildTime ) { return false; }
    
    return new Date(a.lastBuildTime) < new Date(b.lastBuildTime);
  });

  for(branchName in branches) {
    var branch = branches[ branchName ],
      className,
      buildTimeLabel,
      now, buildTime, longAgoInMillis;
    switch(branch.lastBuildStatus) {
      case "Success":
        className = 'success';
        break;

      case "Failure":
        className = 'important'
        break;
      default:
        className = '';
    }
    
    // TODO: separate this
    // format the date a little
    now = new Date();
    buildTime = new Date(branch.lastBuildTime);
    longAgoInMillis = now.getTime() - buildTime.getTime();

    buildTimeLabel = Math.floor(longAgoInMillis / 1000 / 60 / 60 / 24) + " days"
    if ( longAgoInMillis < 1000 * 60 * 60 * 24) {
      buildTimeLabel = Math.floor(longAgoInMillis / 1000 / 60)  + " hours";
      if ( longAgoInMillis < 1000 * 60 * 60) {
        buildTimeLabel = Math.floor(longAgoInMillis / 1000 / 60 / 60) + " minutes";
      }
    }

    label = (className) ? '<span class="label label-' + className + '">' + branch.lastBuildStatus.toLowerCase() + '</span>' : '';
    $messages.append(
      '<li class="' + className + '">' +
      label +
      buildTimeLabel + ' ago ' +
      branch.name.replace(/[O|o]ceans/, '') + '</li>'
    ).click((function(url){
      return function(){
        window.open( url );
      }
    })(branch.webUrl));
  }
});

