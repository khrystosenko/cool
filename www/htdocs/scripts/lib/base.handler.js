function BaseHandler() {
    this.selectors = {};
    this.endpoints = {};
    this.callbacks = {};

    this.init = function() {}

    this.setSelectors = function(selectors) {
        for (var key in selectors) {
            this.selectors[key] = $(selectors[key]);
        }

        return this;
    }

    this.setEndpoints = function(endpoints) {
        for (var key in endpoints) {
            this.endpoints[key] = endpoints[key];
        }

        return this;
    }

    this.setCallbacks = function(callbacks) {
        for (var key in callbacks) {
            this.callbacks[key] = callbacks[key];
        }

        return this;
    }
}