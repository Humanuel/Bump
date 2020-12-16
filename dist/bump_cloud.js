var rootUrl = window.location.origin; // get the root URL, e.g. https://example.herokuapp.com

var app = new Vue({
    el: "#app",
    data: {
        Bumpattempts_0: "unknown",  // the Number of Bumps on device 0
        Bumpattempts_1: "unknown",  // the Number of Bumps on device 1
        BumpCounter: 0,             // how many times the devices have successcully been bumped
        bumpedSync: false,            // true if the devices were bumped within 1 second
        pairingSync: false,
    },
    // This function is executed once when the page is loaded.
    mounted: function () {
        this.initSse();
    },
    methods: {
        // Initialise the Event Stream (Server Sent Events)
        // You don't have to change this function
        initSse: function () {
            if (typeof (EventSource) !== "undefined") {
                var url = rootUrl + "/api/events";
                var source = new EventSource(url);
                source.onmessage = (event) => {
                    this.updateVariables(JSON.parse(event.data));
                };
            } else {
                this.message = "Your browser does not support server-sent events.";
            }
        },
        // react on events: update the variables to be displayed
        updateVariables(ev) {
            // Event "Bump"
            if (ev.eventName === "bumpstatechanged") {
                this.bumpedSync = ev.eventData.bumpSync;
                if (ev.eventData.message === "That's a bump!") {
                    this.BumpCounter = ev.eventData.counter;
                }
            }
            // Event pairingstatechanged
            else if (ev.eventName === "pairingstatechanged") {
                if (ev.eventData.message === "connecting") {
                    this.pairingSync = true;
                }
                if (ev.eventData.message === "connected") {
                    this.pairingSync = false;
                } 
            }
        },
        // call the function "pairing" in your backend
        pairing: function () {
            axios.post(rootUrl + "/api/device/" + 0 + "/function/pairing", { arg: 0 })
            axios.post(rootUrl + "/api/device/" + 1 + "/function/pairing", { arg: 0 })
                .catch(error => {
                    alert("Could not call the function 'pairing' " + ".\n\n" + error)
                })
        },
        // get the value of the variable "bumps" on the device with number "nr" from your backend
        getBumpattempts: function (nr) {
            axios.get(rootUrl + "/api/device/" + nr + "/variable/bumps")
                .then(response => {
                    // Handle the response from the server
                    var Bumpattempts = response.data.result;
                    if (nr === 0) {
                        this.Bumpattempts_0 = Bumpattempts;
                    }
                    else if (nr === 1) {
                        this.Bumpattempts_1 = Bumpattempts;
                    }
                    else {
                        console.log("unknown device number: " + nr);
                    }
                })
                .catch(error => {
                    alert("Could not read the button state of device number " + nr + ".\n\n" + error)
                })
        }
    }
})

var app2 = new Vue({
    el: "#app2",
    data: {
        messages: [],
        lastMessage: ""
    },
    mounted: function () {
        this.initSse();
    },
    methods: {
        initSse: function () {
            if (typeof (EventSource) !== "undefined") {
                var url = window.location.origin + "/api/events";
                var source = new EventSource(url);
                source.onmessage = (event) => { 
                    this.messages.push(event.data);
                    this.lastMessage = event.data;
                };
            } else {
                this.message = "Your browser does not support server-sent events.";
            }
        }
    }
})