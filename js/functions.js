/*This file is intended primarily for the functions that the program may or may not use. It it
 * designed to allow for further extension (see what I did there) and as much code re-use as possible*/
var currentPos = {
    lat: "",
    lng: ""
}; //device's current location as a LatLgn object. Updates every 30secs
var lastPos = {
    lat: "",
    lng: ""
}; //last know coordinates
var accuracy;
var WAYPOINT_RADIUS = 60;
//var map = new google.map();
var siteLoader = document.getElementById("siteLoader");//html object to hold generated content on page
var countTime = 0;//logs app runtime
var TIME_INTERVAL = 10;
var distance = getDistance(currentPos, lastPos);

/**
 * Java still lives!!! say hello to the main method
 */
function main() {
    getCurrentLocation();
    countTime += TIME_INTERVAL;
    report();

    var index = isPredefined();
    console.log("Index: " + index);
    if (index >= 0) {

        //load a page only if we've moved from a pervious waypoint to another
        if (!isEqual(waypointsArr[index].coords, lastPos)) {
            lastPos.lat = waypointsArr[index].coords.lat;
            lastPos.lng = waypointsArr[index].coords.lng;
            $(siteLoader).empty(); //remove current content of siteloader

            //create a new embed object with the location's url
            var embed = "<object data= " + waypointsArr[index].url + " frameborder='0'" +
                " style='overflow: hidden; height: 100%; width: 100%; position: absolute;' height='100%' width='100%'></object>";
            //insert into the page
            $(siteLoader).html(embed);
        }

    } else {

        //if the current location is >60m beyond the last or the first location is not defined, generate a map
        if (!isInRange(lastPos, currentPos) || countTime == TIME_INTERVAL) {
            //update the current location to the current
            lastPos.lat = currentPos.lat;
            lastPos.lng = currentPos.lng;
            //clear the siteloader and load the new google maps object
            $(siteLoader).empty();
            initMap();
        }
    }
}

/**
 * Tests if the device supports GPS or if it's active and also tests for an active connection
 * Throws noConnectivity error when coordinates cannot be found or no network connection available
 * @returns True if the device supports
 */
function testDevice() {
    if (navigator.geolocation && navigator.onLine) {
        console.log("Device GPS active and connected to a network");
    } else {
        /*Throws error on fail no GPS device available*/
        console.log("Device is not supported or GPS feature is disabled\n" +
            "Please enable and refresh the page");
        var error = new Error("Device is not supported or GPS feature is disabled\n" +
            "Please enable and refresh the page");
        error.name = "connectivity";
        throw error;
    }
}

/**
 * Function creates a navigator.geolocation object and obtains the devices location using HTML5/Javascript navigator API
 * Also reports the accuracy of the location given
 * @returns returns the latitude and longitude positions of an object as an array
 */
function getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(function (data) {
        currentPos.lat = data.coords.latitude;
        currentPos.lng = data.coords.longitude;
        accuracy = data.coords.accuracy;
        //if the programming is starting for the first time, set the last position to the current
        if (countTime < TIME_INTERVAL) {
            lastPos.lat = data.coords.latitude;
            lastPos.lng = data.coords.longitude;
        }
    });
}

/**
 *
 * @returns return >= 0 if current location is a waypoint, -1 otherwise
 */
function isPredefined() {
    var shortestDistance = WAYPOINT_RADIUS;//if waypoints overlap, this will hold value of the closest
    var index = -1; //set default to non of the waypoints

    for (var i = 0; i < waypointsArr.length; i++) {
        //If the current location is within range of a waypoint
        if (isInRange(waypointsArr[i].coords, currentPos)) {
            shortestDistance = Math.min(getDistance(waypointsArr[i].coords, currentPos), shortestDistance);
            index = i;
        }
    }
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
 * create new google maps object and inserts into the page. Centered on the last known position
 */
function initMap() {
    $(siteLoader).html("<div id='mapBox'></div>");//create map container
    var mapBox = document.getElementById("mapBox");
    //mapBox.setAttribute("id", "googleMap");

    var mapOptions = {
        zoom: 17,
        center: {lat: lastPos.lat, lng: lastPos.lng}
    }

    //now insert the map
    var map = new google.maps.Map(mapBox, mapOptions);

    //create a marker for the object
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
 *
 * @param {*} errorObject
 */
function errorHandler(errorObject) {
    console.log(errorObject.message);
    /**
     *code to create and active modal with the error message
     */
    alert(errorObject.name + "\n\n" +
        errorObject.message);
}


/**
 Finds distance between two points, using the google geometry library
 If lPos is not initialized, cPos will be used in its place.

 Params:
 cPos - an object with lat and lng fields
 lPos - an object with lat and lng fields

 Pre-conditions: cPos and lPos must be objects with lat and lng fields.
 These fields must be valid latitude and longitude values.

 Post-conditions: the distance between cPos and lPos is returned

 Returns: the distance, in metres, between cPos and lPos
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
 * @param pos1
 * @param pos2
 */
function isEqual(pos1, pos2) {
    return pos1.lat == pos2.lat && pos1.lng == pos2.lng;
}