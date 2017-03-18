$(document).ready(function () { //wait for all documents to fully load
    testDevice();
    getCurrentLocation();
    setInterval(function () {
        main()
    }, 10000);
// setTimeout(main(), 30000);
});

//on start check for GPS availability

