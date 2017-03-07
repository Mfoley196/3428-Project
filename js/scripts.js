/*Global variables - ie scope is throughout the code running from this file. Cannot and should not be redeclared anywhere*/
var currentPos; //device's current location generated by calling the getDeviceLocation() method
var waypoints; //array containing pre-defined waypoints generated by getWaypoints method



/**
 * "main" method for the java users
 */
$(document).ready(function (){
    if(testDevice) {
        console.log("We're now at " + getDeviceLocation());

    } else {
        errorHandler(new Error("You device does not support GPS location or the feature has been disabled"));
    }
    
})