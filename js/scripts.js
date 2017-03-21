//@grant window.close

$(document).ready(function () { //wait for all documents to fully load
    // showAlert("Everything is working for my good");

    // getCurrentLocation();
    //
    // setTimeout(report, 10000);


    try {
        testDevice();
        getCurrentLocation();
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

});

