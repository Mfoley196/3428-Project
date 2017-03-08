/*This file is intended primarily for the functions that the program may or may not use. It it
* designed to allow for further extension (see what I did there) and as much code re-use as possible*/

/**
 * Returns the coordintes of a street address passed to it
 * @param address: street address of a specified location that is recognized on google maps
 * @returns returns the first location object in an array of results. This is often the location closest to the device
 */
function getLocation(address){
    var geo = new google.maps.Geocoder();
    geo.geocoder({'address': address}, function(results, status){
        if (status == google.maps.GeocoderStatus.OK) {
            return results[0].geometry.location;
        }
    });
}

/**
 * Function creates a navigator.geolocation object and obtains the devices location using getCurrentPosition
 * @returns returns the latitude and longitude positions of an object as an array
 */
function getDeviceLocation(){
    geo = navigator.geolocation; //create geolocation object
    geo.getCurrentPosition(function(pos){
        console.log(pos.coords.toString());
        return pos.coords.LatLng;
    });
}


/**
 * Accepts coordinates of a location and places it's marker on the map with name
 * @param LatLng: location coordinates in the form of Longitude and Latitude
 * @param name:  Name of the location marked down
 * @param mapVar: Initialized google maps object
 */
function setMarker(LatLng, name, mapVar){
    var marker = new google.maps.Marker({
        map: mapVar,
        position: LatLng,
        title: name
    });
}

/**
 * Function places a balloon/marker in the page map.
 * @param address - location address as a street address in String format
 * @param map - the google map object on the page
 */
function placeMarkers(address, map){
    var geoCode = new google.maps.Geocoder();
    //function incomplete

}

/**
 * Tests if the device supports GPS or if it's active
 * @returns True if the device supports
 */
function testDevice(){
    if(navigator.geolocation){
        console.log("Device GPS active. Returned value true");
        return true;
    } else {
        console.log("Device is not supported or GPS feature is disabled\n"
        + "Please enable and refresh the page");
        return false;
    }
}

/**
 * 
 * @param {*} errorMessage the error message you want to print to the screen.
 * 
 */
function errorPrint(errorMessage){
        console.log(errorMessage);
        var main = document.getElementById("errorPar");
        main.innerHTML(errorMessage);
}

/**
 * 
 * @param {*} errorObject 
 */
function errorHandler(errorObject){
    console.log(errorObject.message);
    alert(errorObject.message);
}


/**
* Function for loading waypoints into a JSON array
* @param url - url of the json file containing the waypoints
* @returns - json object containing the waypoints
*/
function getWaypoints(url){
    var waypoints;
    // $.getJSON(url, function(data) {
    // console.log(data);
    // waypoints = data; // this will show the info it in firebug console
    // });
    //trying with ajax request and jsonp

    /*This jQuery method use jsonp instead of XMLHttpRequest to bypass the cross-origin policy
    for more information on this see https://www.w3schools.com/js/js_json_jsonp.asp and 
    http://stackoverflow.com/questions/2067472/what-is-jsonp-all-about
    http://stackoverflow.com/questions/3839966/can-anyone-explain-what-jsonp-is-in-layman-terms
    */
    $.ajax({
        url: url,
        dataType: 'jsonp',
        success: function(data) {
            waypoints = data;
            console.log(date);
            console.log(waypoints);
        }
    });
    
    return waypoints
}
