$(document).ready(function(){
  function help(e) {
    e.preventDefault();
    e.stopPropagation();
    $("#help-popup").addClass("show-help");
  }

  function warguns() {
    chrome.tabs.create({url: "https://github.com/warguns"});
  }

  function gitHub() {
    chrome.tabs.create({url: "https://github.com/warguns/youtube-comments-chrome-plugin"});
  }

  function review() {
    chrome.tabs.create({url: "https://github.com/warguns/youtube-comments-chrome-plugin"});
  }


  // Events
  $(document).on("click", "#github", gitHub);
  $(document).on("click", "#review", review);
  $(document).on("click", "#footer span", warguns);
  $(document).on("click", "#help", help);
});
