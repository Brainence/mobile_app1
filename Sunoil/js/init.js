
//main menu interceptor

var mainmenu = '<div data-role="panel" id="main-menu-panel" data-theme="a"> <h2  class="menu-header">Sunoil</h2><ul class="list-group"><li ref="#index" class="list-group-item orange-list-item"><a href="#map" class="menu-button">Карта АЗС</a></li><li class="list-group-item orange-list-item"><a href="#stationsList" class="menu-button">Список АЗС</a></li></ul> </div>';


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
var runRouteTask = function(pin){
    angular.element(document.getElementById('map')).scope().buildRouteToPin(pin);
}