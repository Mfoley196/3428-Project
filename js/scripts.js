/*Main program runtime file*/

$(document).ready(function () { //wait for all documents to fully load

    try {
        prep();
        startTimer();

        //checks if the location tracking has been enabled for the page in the browser
        navigator.permissions.query({'name': 'geolocation'}).then(function (result) {
            console.log("This is my geolocation permission state: " + result.state);

            if (result.state === "denied") {
                var err = new Error("Location could not be generated because you have it blocked. Please allow location" +
                    "tracking in your browser to use the program");
                err.name = "Location Access Denied";
                //if the request has been denied then throw error and notify user then close after 5s
                errorHandler(err)
            }
        });

        // if location tracking privileges are granted, run the main program
        try {

            setTimeout(function () {

                main();

                setInterval(function () {
                    main()
                }, REFRESH_RATE * 1000);

            }, 10000);

        } catch (e) {
            errorHandler(e);
        }

    } catch (e) {
        errorHandler(e);
        console.log(e.toString());
    }


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
})
;

