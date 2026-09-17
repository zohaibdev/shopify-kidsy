/*
  Promo code copy control
  ---------------------------------------------------------------------------
  Any element carrying data-promo-code becomes a one-click "copy the code"
  control: clicking (or pressing Enter/Space, since they are <button>s) writes
  the code to the clipboard and shows a short confirmation.

  The CSS also sets user-select: all on those elements, so a single click
  selects the whole code — if the clipboard is unavailable (an insecure
  origin, a locked-down browser, an in-app webview) the code is still selected
  and ready for a manual copy.

  One delegated listener on the document covers every instance on the page —
  the home hero, the collection banner and the PDP shipping bar — so the file
  can be included by all three without doing any work more than once.
*/
if (!window.kidsyPromoCodeReady) {
  window.kidsyPromoCodeReady = true;

  (function () {
    var COPIED_MS = 1800;
    var liveRegion = null;

    function announce(message) {
      if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.style.cssText =
          'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;' +
          'clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0';
        document.body.appendChild(liveRegion);
      }
      liveRegion.textContent = '';
      window.setTimeout(function () {
        liveRegion.textContent = message;
      }, 50);
    }

    // Select the code itself, so a failed clipboard write still leaves the
    // shopper with the code highlighted and ready to copy by hand.
    function selectText(element) {
      try {
        var range = document.createRange();
        range.selectNodeContents(element);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (error) {
        /* selection is a nicety, never a failure */
      }
    }

    function writeToClipboard(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
      }
      // Fallback for non-secure origins / older browsers.
      return new Promise(function (resolve, reject) {
        var field = document.createElement('textarea');
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
        document.body.appendChild(field);
        field.select();
        var copied = false;
        try {
          copied = document.execCommand('copy');
        } catch (error) {
          copied = false;
        }
        field.remove();
        copied ? resolve() : reject(new Error('copy unavailable'));
      });
    }

    function confirm(element) {
      var label = element.getAttribute('data-copied-label') || 'Copied!';
      element.classList.add('is-copied');
      announce(label);
      window.clearTimeout(element.kidsyCopyTimer);
      element.kidsyCopyTimer = window.setTimeout(function () {
        element.classList.remove('is-copied');
      }, COPIED_MS);
    }

    document.addEventListener('click', function (event) {
      var target = event.target;
      var element = target && target.closest ? target.closest('[data-promo-code]') : null;
      if (!element) return;

      var code = element.getAttribute('data-promo-code') || element.textContent.trim();
      if (!code) return;

      event.preventDefault();
      selectText(element);
      writeToClipboard(code).then(
        function () {
          confirm(element);
        },
        function () {
          // Clipboard refused — the code is selected, tell the shopper so.
          var fallback = element.getAttribute('data-select-label');
          if (fallback) {
            element.setAttribute('data-copied-label', fallback);
          }
          confirm(element);
        }
      );
    });
  })();
}
