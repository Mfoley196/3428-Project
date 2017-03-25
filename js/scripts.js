/*Main program runtime file*/

$(document).ready(function () { //wait for all documents to fully load

    prep();

    //checks if the location tracking has been enabled for the page in the browser
    navigator.permissions.query({'name':'geolocation'}).then(function (result) {

        // console.log("This is my geolocation permission state: " + result.state);

        if (result.state === 'denied') {
            var error = new Error("Location could not be generated because you have it blocked. Please allow location" +
                "tracking in your browser to use the program");
            error.name = "Location Access Denied";
            // if the request has been denied then throw error and notify user
            errorHandler(error);
        }
    });
        // else if (result.state === 'prompt') {
        //     var error = new Error("Please grant permissions for location tracking in your browser");
        //     error.name = "Request Location Access";
        //     //if the permission is still in "prompt" status, throw error and restart after 30 seconds
        //     errorHandler(error);
        //     setTimeout(function () {
        //         location.reload();
        //     }, TIME_INTERVAL * 1000); //reload after 30 seconds

        // } else if (result.state === 'granted') {

            prep();
            // if location tracking privileges are granted, run the main program
            try {
                testDevice();
                startTimer();
                setTimeout(function () {
                    main();
                }, 10000);
                setInterval(function () {
                    main()
                }, TIME_INTERVAL * 1000);
            } catch (e) {
                errorHandler(e);
            }
        // }
    // });


    /*UI event handlers*/
    //reload when the button is clicked
    $('#reloadApp').click(function () {
        location.reload(true);
    });

    //exit the app when the button is click
    $('#exitApp').click(function () {
        window.close();
    });

    $('.exit').click(function () {
        window.close();
    });

    //open user guide modal on click
    $('.help').click(function () {
        $('#myHelp').modal('show');
    });

});

