(function (root, smoothScroll) {
  'use strict';

  // Support RequireJS and CommonJS/NodeJS module formats.
  // Attach smoothScroll to the `window` when executed as a <script>.

  // RequireJS
  if (typeof define === 'function' && define.amd) {
    define(smoothScroll);

    // CommonJS
  } else if (typeof exports === 'object' && typeof module === 'object') {
    module.exports = smoothScroll();
  } else {
    root.smoothScroll = smoothScroll();
  }
})(this, function () {
  'use strict';

  // Do not initialize smoothScroll when running server side, handle it in client:
  if (typeof window !== 'object') {
    return;
  }

  // We do not want this script to be applied in browsers that do not support those
  // That means no smoothscroll on IE9 and below.
  if (document.querySelectorAll === void 0 || window.pageYOffset === void 0) {
    return;
  }

  var getViewportHeight = function (container) {
    return container === window ? window.innerHeight : container.offsetHeight;
  };
  var getCurrentScrollPosition = function (container) {
    return container === window ? window.pageYOffset : container.scrollTop;
  };
  var scrollTo = function (container, scrollTop) {
    if (container === window) {
      container.scroll(0, scrollTop);
    } else {
      container.scrollTop = scrollTop;
    }
  };
  // Get the top position of an element in the container
  var getTop = function (container, element) {
    if (container === window) {
      return element.getBoundingClientRect().top + window.pageYOffset;
    }

    // Get top relative to container
    var top = 0;
    var aContainerChild = element;
    while (aContainerChild && aContainerChild !== container) {
      top += aContainerChild.offsetTop;
      aContainerChild = aContainerChild.offsetParent;
    }
    return top;
  };
  var getTopWhenCentered = function (container, element, offset) {
    var viewportHeight = getViewportHeight(container);
    var elementHeight = element.clientHeight;
    var elementTop = getTop(container, element);
    if (elementHeight >= viewportHeight) { // when it doesn't fit, scroll its top into top
      return elementTop;
    }
    return elementTop - (viewportHeight - elementHeight - offset) / 2;
  };

  var isWithinViewport = function (container, element) {
    var top = getTop(container, element);
    var viewportHeight = getViewportHeight(container);

    return
  };

  // ease in out function thanks to:
  // http://blog.greweb.fr/2012/02/bezier-curve-based-easing-functions-from-concept-to-implementation/
  var easeInOutCubic = function (t) {
    return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  };

  // calculate the scroll position we should be in
  // given the start and end point of the scroll
  // the time elapsed from the beginning of the scroll
  // and the total duration of the scroll (default 500ms)
  var position = function (start, end, elapsed, duration) {
    if (elapsed > duration) {
      return end;
    }
    return start + (end - start) * easeInOutCubic(elapsed / duration); // <-- you can change the easing funtion there
    // return start + (end - start) * (elapsed / duration); // <-- this would give a linear scroll
  };

  // we use requestAnimationFrame to be called by the browser before every repaint
  // if the first argument is an element then scroll to the top of this element
  // if the first argument is numeric then scroll to this location
  // if the callback exist, it is called when the scrolling is finished
  // if context is set then scroll that element, else scroll window
  return function (el, duration, options) {
    duration = typeof duration === 'number' ? duration : 500;
    options = options || {};
    var offset = options.offset || 0;
    var callback = options.callback;
    var goToTop = options.goToTop || false;
    var container = options.container || window;
    var onlyIfNeeded = options.onlyIfNeeded || false;

    var scrollTopStart = getCurrentScrollPosition(container);
    var scrollTopTarget;
    if (typeof el === 'number') {
      scrollTopTarget = parseInt(el);
    } else {
      if (typeof el === 'string' && el.substr(0, 1) === '#') { // shortcut for links to ids (e.g. the anchor for top in #top is an element with the ID "top")
        var hash = el;
        var id = hash.substr(1);
        el = document.getElementById(id);
        location.hash = hash;
      }
      scrollTopTarget = goToTop ? getTop(container, el) : getTopWhenCentered(container, el, offset);
    }
    scrollTopTarget = scrollTopTarget - offset; // apply offset prior to checking if it's within viewport as the offset usually is some area that is not visible

    if (onlyIfNeeded) {
      var viewportHeight = getViewportHeight(container);
      var withinViewport = scrollTopStart < scrollTopTarget && (scrollTopStart + viewportHeight) > scrollTopTarget;
      if (withinViewport) {
        return;
      }
    }

    var clock = Date.now();
    var requestAnimationFrame = window.requestAnimationFrame ||
      window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
      function (fn) {
        window.setTimeout(fn, 15);
      };

    var step = function () {
      var elapsed = Date.now() - clock;
      var newScrollTop = position(scrollTopStart, scrollTopTarget, elapsed, duration);
      scrollTo(container, newScrollTop);

      if (elapsed > duration) {
        if (typeof callback === 'function') {
          callback(el);
        }
      } else {
        requestAnimationFrame(step);
      }
    };
    step();
  };
});
