
//main menu interceptor

var mainmenu = '<div data-role="panel" id="main-menu-panel" data-theme="a"> <p>Sunoil</p><ul class="list-group"><li ref="#index" class="list-group-item"><a href="#map">Карта</a></li><li class="list-group-item"><a href="#stationsList">Список</a></li></ul> </div>';

$(document).one('pagebeforecreate', function () {
    $.mobile.pageContainer.append(mainmenu);
    $("#main-menu-panel").panel();
});

//main menu interceptor

$(document).on("pageinit", "#demo-page", function() {
    $(document).on("swipeleft swiperight", "#index", function(e) {
        // We check if there is no open panel on the page because otherwise
        // a swipe to close the left panel would also open the right panel (and v.v.).
        // We do this by checking the data that the framework stores on the page element (panel: open).
        if ($.mobile.activePage.jqmData("panel") !== "open") {
            if (e.type === "swipeleft") {
                $("#right-panel").panel("open");
            } else if (e.type === "swiperight") {
                $("#left-panel").panel("open");
            }
        }
    });
});

var initmap = function(){
    angular.element(document.getElementById('map')).scope().initMap();
}