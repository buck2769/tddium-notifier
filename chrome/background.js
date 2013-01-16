;(function(){
  // TODO: fix this to actually work
  activateTabs();

  return true;
  var tddiumUrl = 'https://api.tddium.com/cc/88b9f80b5bbe2b868e322362762e8ec1666f1f76/cctray.xml',
    branches = {},
    firstRunKey = 'tddium-notifier:' + chrome.app.getDetails().version,
    $projectBranches;

  function activateTabs(){
    chrome.tabs.onActivated.addListener(function(activeInfo){
      // deactivate all inactive tabs
      chrome.tabs.query({
        url: 'https://api.tddium.com/*',
        active: false
      }, function(tabs){
        tabs.forEach(function(tab) {
          chrome.tabs.sendMessage(tab.id, 'deactivate');
        });
      });

      chrome.tabs.get(activeInfo.tabId, function(tab){
        if ((/api\.tddium\.com[\/dashboard]*/i).test(tab.url)) {
          chrome.tabs.sendMessage(tab.id, 'activate', function(){
          });
        }
      });
    });
  };

  activateTabs();

  this.updateFeaturePrefix = function(){
    featurePrefix = new RegExp( localStorage.getItem('branchPattern') );
    branches = {};
  };
  this.updateFeaturePrefix();
  
  // first run
  if ( ! localStorage.getItem(firstRunKey) ) {
    chrome.tabs.create({ url: "options.html" });
    localStorage.setItem( firstRunKey, true );
  }

  function parseProject( projectNode ) {
    return { name: projectNode.attr('name'),
      lastBuildTime: projectNode.attr('lastBuildTime'),
      activity: projectNode.attr('activity'),
      webUrl: projectNode.attr('webUrl'),
      lastBuildStatus: projectNode.attr('lastBuildStatus') };
  }

  function updateBranches($branch) {
    var name = $branch.attr('name'),
      project = parseProject( $branch ),
      notification;


      notification = webkitNotifications.createNotification(
        'images/fire.png',
        $branch.attr('lastBuildStatus') || name,
        name + ": " + $branch.attr('lastBuildStatus') || $branch.attr('activity')
      );

    if ( ! _.has(branches, name) ) {
      branches[ name ] = project;
      notification.show();
    } else if ( new Date(branches[name].lastBuildTime) < new Date(project.lastBuildTime)) {
      branches[ name ] = project;
      notification.show();
    }
  }

  this.getBranches = function(){
    return branches;
  };
  
  this.updateDisplays = function(){
    // TODO: DRY the hell out of this. I have three loops that could be reduced
    var featureBranches = $projectBranches.map(function(item) {
      if ( featurePrefix.test( $(this).attr('name') ) ) { return this; }
    }),
      failedCount;
    
    failedCount = _.reduce(featureBranches, function(memo, branch) {
      return ( $(branch).attr('lastBuildStatus') == 'Failure' && ++memo) || 0;
    }, 0);

    $(featureBranches).each(function(){
      // TODO: change icon
      var $branch = $(this);
      updateBranches($branch);
    });

    // TODO: set a badgeText if the last build failed
    chrome.browserAction.setBadgeText({ text: (failedCount || '' ).toString() });
  };

  function fetchStatus(){
    var self = this;
    $.ajax({
      url: tddiumUrl,
      cache: false,
      success: function(res) {
        $projectBranches = $(res).find('Project');
        self.updateDisplays($projectBranches);

      },
      dataType: 'xml'
    });
  }

  // set it on the window so we can debug
  this.fetchStatus = fetchStatus;

  _.defer(fetchStatus);
  setInterval(fetchStatus, parseInt(localStorage.getItem('refreshTime') || 0, 10) * 1000 * 60);
}).call(this);
