/*This file is intended primarily for the functions that the program may or may not use. It it
 * designed to allow for further extension (see what I did there) and as much code re-use as possible*/

/*Globals*/
/*
The following are constants to be set at the time of development.
*/
//The radius of a waypoint in metres.
var WAYPOINT_RADIUS = 30;
//The initial value of the countdown timer on the opening screen, in seconds.
var START_TIME = 10;
//Timing variable used for handling in getCurrentLocation on startup.
var TIME_INTERVAL = 30;
//The number of seconds between location updates.
var REFRESH_RATE = 5;

/*
The following are variables that allow interfacing across multiple functions.
*/
//The number of seconds the app has been running.
var countTime = 0;
//HTML objects to hold generated content on the page.
var siteLoader = document.getElementById("siteLoader");
var errorModal = document.getElementById("myModal");
var alertBox = document.getElementById("alertBox");
//The accuracy of the coordinates provided by the GPS in metres.
var accuracy;
//The devices's current location as a LatLgn object.
var currentPos = {
    lat: "",
    lng: ""
};
//The coordinates from the next to last update.
var lastPos = {
    lat: "",
    lng: ""
};

/**
 * At on device run, prompts for location to trigger permissions request
 */
function prep() {
    try {
        testDevice();
        getCurrentLocation();
    } catch (e) {
        e.name = "GPS/Network Error";
        e.message = "Could not connect to a network or GPS device is unavailable. Please check your device and restart" +
            " the extension";
        throw e;
    }
}

/**
 * Java still lives!!! say hello to the main method
 *
 *
 *
 */
function main() {
    try {
        testDevice();
        getCurrentLocation();
        countTime += REFRESH_RATE;
        report();

        var index = isPredefined();
        console.log("Index: " + index);
        if (index >= 0) {

            //load a page only if we've moved from a previous waypoint to another   position: static;
            if (!isEqual(waypointsArr[index].coords, lastPos)) {
                lastPos.lat = waypointsArr[index].coords.lat;
                lastPos.lng = waypointsArr[index].coords.lng;
                $(siteLoader).empty(); //remove current content of siteloader

                //create a new embed object with the location's url
                var embed = "<object id='siteBox' data= " + waypointsArr[index].url + " frameborder='0'" +
                    " style='display: block; height: auto; width: 100%;'></object>";
                //insert into the page
                $(siteLoader).html(embed);
            }

        } else {

            //if the current location is >30m beyond the last or the first location is not defined, generate a map
            if (!isInRange(lastPos, currentPos) || countTime === REFRESH_RATE) {
                //update the current location to the current
                lastPos.lat = currentPos.lat;
                lastPos.lng = currentPos.lng;
                //clear the siteloader and load the new google maps object
                $(siteLoader).empty();
                initMap();
            }
        }

        //alert if accuracy is beyond WAYPOINT_RADIUS
        if (accuracy > WAYPOINT_RADIUS) {
            showAlert("Accuracy is within a " + Math.round(accuracy) + "m radius");
        }

    } catch (e) {
        errorHandler(e);
    }

}

/**
 * Start page countdown timer
 * Counts down from START_TIME to 1
 */
function startTimer() {
    var i = START_TIME;
    var countdownTimer = setInterval(function () {
        document.getElementById("output").innerHTML = i + " seconds remaining";
        i = i - 1;
        if (i <= 0) {
            clearInterval(countdownTimer);
        }
    }, 1000);
}

/**
 * Tests if the device supports GPS or if it's active and also tests for an active connection
 * Throws noConnectivity error when coordinates cannot be found or no network connection available
 * @returns True if the device supports
 */
function testDevice() {

    if (navigator.geolocation && navigator.onLine) {
        console.log("Device GPS active and connected to a network");
        getCurrentLocation();
    } else {
        /*Throws error on fail no GPS device available or no wifi*/
        var err = new Error("Device is not supported or GPS/Wifi is disabled\n" +
            "Please enable and refresh the page", "No Connectivity");
        err.name = "Connectivity Error";
        throw err;
    }
}

/**
 * Function creates a navigator.geolocation object and obtains the devices location using HTML5/Javascript navigator API
 * Also reports the accuracy of the location given
 *
 * Pre-Conditions: TIME_INTERVAL must be initialized. User must have granted the program location access
 *
 * Post-Conditions: currentPos is set to the user's current position. accuracy is set. If the program is starting, lastPos is
 *                  set to currentPos.
 *
 * @returns lat and lng fields of the currentPos variable, the accuracy of the coordinates, or an error if the API
 *          can't generate coordinates
 */
function getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(function (posData) {
        currentPos.lat = posData.coords.latitude;
        currentPos.lng = posData.coords.longitude;
        accuracy = posData.coords.accuracy;
        //if the programming is starting for the first time, set the last position to the current
        if (countTime < TIME_INTERVAL) {
            lastPos.lat = posData.coords.latitude;
            lastPos.lng = posData.coords.longitude;
        }
    }, function () {
        //If geolocation API can't get coordinates
        showAlert("Could not generate current coordinates");
    });
}

/**
 * Checks if user's current location is in radius of any waypoint
 *
 * Pre-Conditions: WAYPOINT_RADIUS must be initialized. waypoints must be initialized.
 *
 * Post-Conditions: If the user is in radius of a waypoint, the index of that waypoint is returned, otherwise -1 is returned.
 *                  If currentPos is null, the index of the last waypoint in the array is returned.
 * 
 * @returns return >= 0 if current location is a waypoint, -1 otherwise
 */
function isPredefined() {
    var shortestDistance = WAYPOINT_RADIUS;//if waypoints overlap, this will hold value of the closest
    var index = -1; //set default to none of the waypoints

    //Loop through all waypoints in array
    for (var i = 0; i < waypointsArr.length; i++) {
        //If the current location is within range of a waypoint
        if (isInRange(waypointsArr[i].coords, currentPos)) {
            shortestDistance = Math.min(getDistance(waypointsArr[i].coords, currentPos), shortestDistance);
            index = i;
        }
    }
    //Return index of the waypoint - else, return -1
    return index;
}

/**
 * Reports the current state of global variables and other system runtime values. Can be modified to report
 * more
 */
function report() {
    console.log("Time: " + countTime + "s\nCurrent position is lat: " + currentPos.lat + " and " + " lng: "
        + currentPos.lng + "\n" + "Last position is lat: " + lastPos.lat + " and " + " lng: " + lastPos.lng + "\n" +
        "Accuracy is: " + accuracy + "\n" + "Distance: " + getDistance(currentPos, lastPos)
    );
}

/**
 * Create new google maps object and inserts into the page. Centered on the last known position.
 * Map displays marker for user's position
 * Map displays markers for each waypoint in the array
 *
 * Pre-Conditions: waypoints must be initialized. The program must have location access to the user's device
 *
 * Post-Conditions: A map object is displayed on screen, with markers drawn for the user's last location, and the waypoints.
 *
 */
function initMap() {
    $(siteLoader).html("<div id='mapBox'></div>");//create map container
    var mapBox = document.getElementById("mapBox");
    //mapBox.setAttribute("id", "googleMap");

    var mapOptions = {
        zoom: 17,
        center: {lat: lastPos.lat, lng: lastPos.lng}
    };

    //now insert the map
    var map = new google.maps.Map(mapBox, mapOptions);

    //create a marker for user's position
    var marker = new google.maps.Marker({
        position: lastPos,
        map: map
    });

    var mark;

    //Show markers for each waypoint using custom markers
    for (i = 0; i < waypointsArr.length; i++) {
        var pos = new google.maps.LatLng(waypointsArr[i].coords.lat, waypointsArr[i].coords.lng);
        mark = new google.maps.Marker({
            position: pos,
            map: map,
            title: waypointsArr[i].name,
            icon: "./icon.png"
        });
    }
}

/**
 * Accepts an error object and opens a modal on the page with the details and instructions about the error. It will
 * handle which action to take based on teh kind of error.
 *
 * Pre-Conditions: error must be initialized. REFRESH_RATE must be initialized.
 *
 * Post-Conditions: The error is displayed on screen. If a Location Access error has occured, the program will exit after 5 seconds.
 *                  Otherwise, the app will refresh in 5 seconds.
 *
 * @param {*} error : error object thrown by a function
 */
function errorHandler(error) {

    console.log(error.message);
    document.getElementById("modalName").innerHTML = '<i class="fa fa-exclamation-circle" aria-hidden="true" ' +
        'style="color: red;"></i>  ' + error.name;
    document.getElementById("modalMessage").innerHTML = error.message;
    $(errorModal).modal('show');

    console.log(error.name);
    //countdown and reload after 5 secs
    var i = REFRESH_RATE;

    if (error.name === "Request Location Access") {
        //this is an expected error. No throwing needed
    } else if (error.name === "Location Access Denied" || error.name === "GPS/Network Error") {//do this if location is blocked

        function selfDestruct() {
            var countdownTimer = setInterval(function () {
                document.getElementById("reloadApp").innerHTML = "Exiting in " + i;
                i = i - 1;
                if (i <= 0) {
                    clearInterval(countdownTimer);
                }
            }, 1000);
        }

        selfDestruct();

        setTimeout(function () {
            window.close();
        }, REFRESH_RATE * 1000);

    } else {

        function reloadTimer() {
            var countdownTimer = setInterval(function () {
                document.getElementById("reloadApp").innerHTML = "Reloading in " + i;
                i = i - 1;
                if (i <= 0) {
                    clearInterval(countdownTimer);
                }
            }, 1000);
        }

        reloadTimer();
        setTimeout(function () {
            window.location.reload(true);
        }, REFRESH_RATE * 1000);
    }


}

/**
 * Finds distance between two points, using the google geometry library
 * If lPos is not initialized, cPos will be used in its place.
 *
 * Pre-Conditions: cPos must be initialized. The Google Maps Geometry API must be imported.
 *
 * Post-Conditions: The spherical distance between cPos and lPos is returned
 *
 * @param cPos - an object with lat and lng fields
 * @param lPos - an object with lat and lng field
 *
 * @returns {float} the distance, in metres, between cPos and lPos
 */
function getDistance(cPos, lPos) {
    //Convert cPos to a LatLng object
    cur = new google.maps.LatLng(cPos.lat, cPos.lng);
    //if lPos does not exist, use cPos to convert to a LatLng object
    if (lPos.lat || lPos.lng) {
        last = new google.maps.LatLng(lPos.lat, lPos.lng);
    }
    else {
        last = new google.maps.LatLng(cPos.lat, cPos.lng);
    }
    return google.maps.geometry.spherical.computeDistanceBetween(last, cur);
}

/**
 * Calculates if the distance between pos1 and pos2 is less than WAYPOINT_RADIUS
 * Uses getDistance function
 *
 * Pre-Conditions: pos1 and pos2 must be initialized. WAYPOINT_RADIUS must be initialized.
 *
 * Post-Conditions: Returns True or False depending on whether the distance between pos1
 *                  & pos2 is less than WAYPOINT_RADIUS
 *
 * @param pos1: reference point. {lat: lng: } object
 * @param pos2: new location {lat: lng: } object
 * @returns {boolean} true if pos2 is within 60m of pos1
 */
function isInRange(pos1, pos2) {
    return Math.round(getDistance(pos1, pos2)) <= WAYPOINT_RADIUS;
}

/**
 * Compares two coordinates to see if they are the same. Different from isInRange which checks whether the second position
 * is within 60m of the other
 *
 * Pre-Conditions: pos1 and pos2 must be initialized
 *
 * Post-Conditions: Returns True or False depending on if pos1 and pos2 are equal.
 *
 * @param pos1 - {lat: lng: } object
 * @param pos2 - {lat: lng: } object
 * @returns {boolean} true if both position objects have the same lat and lng values
 */
function isEqual(pos1, pos2) {
    return pos1.lat === pos2.lat && pos1.lng === pos2.lng;
}

/**
 * Function for displaying error messages
 *
 * Pre-Conditions - message must be initialized
 *
 * Post-Conditions - An error message using the "message" parameter is displayed on the screen.
 *
 * @param message - string with error message
 */
function showAlert(message) {
    alertHTML = '<div id="warning" class="alert alert-warning" role="alert"> <strong>Warning!</strong> ' + message + '</div>';
    $(alertBox).html(alertHTML);
}
