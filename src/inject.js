$(document).ready(function(){
  var gauge = null;
  var observer = null;
  var commentsLoaded = false;
  var options = {
    root: null,
    rootMargin: "0px",
    threshold: 1.0
  };
  var isDark = false;

  var opts = {
    angle: -0.21, // The span of the gauge arc
    lineWidth: 0.16, // The line thickness
    radiusScale: 0.85, // Relative radius
    pointer: {
      length: 0.43, // // Relative to gauge radius
      strokeWidth: 0.068, // The thickness
      color: '#000000' // Fill color
    },
    limitMax: false,     // If false, max value increases automatically if value > maxValue
    limitMin: false,     // If true, the min value of the gauge will be fixed
    colorStart: '#6FADCF',   // Colors
    colorStop: '#8FC0DA',    // just experiment with them
    strokeColor: '#E0E0E0',  // to see which ones work best for you
    generateGradient: true,
    highDpiSupport: true,     // High resolution support
    staticZones: [
      {strokeStyle: "#F03E3E", min: 0, max: 70}, // Red from 100 to 130
      {strokeStyle: "#FFDD00", min: 40, max: 70}, // Yellow
      {strokeStyle: "#30B32D", min: 70, max: 100}, // Green
    ],
    staticLabels: {
      font: "10px sans-serif",  // Specifies font
      labels: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],  // Print labels at these values
      color: "#000000",  // Optional: Label text color
      fractionDigits: 0  // Optional: Numerical precision. 0=round off.
    },
  };

  var style = getComputedStyle(document.querySelector('html'));
  if (style.backgroundColor === 'rgb(15, 15, 15)') {
    opts.pointer.color = '#FFFFFF';
    opts.staticLabels.color = '#FFFFFF';
    isDark = true;
  }


  function removeInjected() {
    $("#commentMood-gauges").remove();
    if (observer !== null) {
      observer.unobserve(document.querySelector('#comments'));
    }
  }

  function updateGauges(statistics) {
    setTimeout(function() {
      $('#loading').remove();
      gauge.set(statistics)
    }, 400);

  }

  function checkComments() {
    window.setTimeout(function() {
      observer = new IntersectionObserver(handleIntersect, options);
      observer.observe(document.querySelector('#columns'));
    }, 500);
  }

  function handleIntersect(entries, observer) {
    if (commentsLoaded === true) {
      return;
    }

    window.setTimeout(function(){
      var comments = [];
      $.each($('#content-text.ytd-comment-renderer'), function (index, value) {
        comments.push(value.innerText);
      });

      $.get(chrome.runtime.getURL('/content.html'), function(data) {
        $(data).prependTo('#comments');
        if (isDark) {
          $('#commentMood').addClass('dark');
        }
        gauge = new Gauge(document.getElementById('commentMood-gauges')).setOptions(opts);
        gauge.maxValue = 100;
        gauge.setMinValue(0);
        gauge.animationSpeed = 30;
        gauge.set(0);
        console.log(comments);
        chrome.runtime.sendMessage({type: "statistics", comments:comments});
      });

    }, 3000);

    commentsLoaded = true;
  }

  function checkTheme() {
    if (window.matchMedia('(prefers-color-scheme: dark)')) {
      chrome.runtime.sendMessage({type: "change-icon", theme:"dark"});
    } else {
      chrome.runtime.sendMessage({type: "change-icon", theme:"light"});
    }
  }

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "watching-now") {
      checkComments();
      checkTheme();
    } else if (request.type === "watching-stop") {
      removeInjected();
    } else if (request.type === "statistics-response") {
      updateGauges(request.result);
    }
  });
});
