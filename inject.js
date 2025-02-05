// Check if XMLHttpRequest is already hooked
if (!window.hasHookedXMLHttpRequest) {
  window.hasHookedXMLHttpRequest = true;

  // Store original methods
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  // Hook into the 'open' method (to intercept the initialisation of every XHR request)
  XMLHttpRequest.prototype.open = function (
    method,
    url,
    async,
    user,
    password
  ) {
    this._url = url;

    return originalOpen.apply(this, arguments);
  };

  // Hook into the 'send' method
  XMLHttpRequest.prototype.send = function (body) {
    this.addEventListener("load", function () {
      // Only intercept if the request suceeds
      if (this._url.includes(`https://api2.maang.in/problems/user/`)) {
        const data = {
          url: this._url,
          status: this.status,
          response: this.responseText,
        };

        // Dispatch a custom event with the data
        window.dispatchEvent(
          new CustomEvent("xhrDataInjected", { detail: data })
        );
      }
    });

    return originalSend.apply(this, arguments);
  };
}
