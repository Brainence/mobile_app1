var sunoil_application = angular.module("sunoilMobileApp", []);

angular.module('sunoilMobileApp')
    .factory('templates', function() {
        return {
            menuTemplate: $("#menuTemplate").html(),
            sunoilStationTemplate: $("#sunoilStationTemplate").html()
        };
    })
    .controller('mapController', ['$scope', 'templates', function($scope, templates) {
        var _map;
        var _styleArray = [{"stylers":[{"saturation":-100},{"gamma":1}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"on"},{"saturation":50},{"gamma":0},{"hue":"#50a5d1"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.fill","stylers":[{"color":"#333333"}]},{"featureType":"road.local","elementType":"labels.text","stylers":[{"weight":0.5},{"color":"#333333"}]},{"featureType":"transit.station","elementType":"labels.icon","stylers":[{"gamma":1},{"saturation":50}]}]
        var _clusterStyles = [{height:64,width:64,url:"img/pins/m1.png",textColor:"white"},{textColor:"white",height:90,width:90,url:"img/pins/m2.png"},{textColor:"white",height:90,width:90,url:"img/pins/m2.png"},{textColor:"white",height:90,width:90,url:"img/pins/m2.png"},{textColor:"white",height:90,width:90,url:"img/pins/m2.png"}];
        var _stations = [];
        var _markers = [];
        
        $scope.templates = templates;
        $scope.map = _map;
        $scope.stations = _stations;
        $scope.markers = _markers;
        $scope.initMap = function() {
            _map = document.getElementById("main-map");
            latlng = new google.maps.LatLng(49.082586, 31.227971);
				
            myOptions = {
                zoom: 6,
                center: latlng,
                mapTypeControl: false,
                navigationControlOptions: { style: google.maps.NavigationControlStyle.SMALL },
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                styles: _styleArray
            };
			    
            mapObj = new google.maps.Map(_map, myOptions);
            $scope.refreshMap();
        };
        $scope.refreshMap = function(){
            $scope.markers = [];
            /* read data from json */
            jQuery.getJSON("http://sunoil.org/data.json", function (data) {
                var regions = data.regions; // get obj with all regions
                for (var region in regions) {
                    var sts = regions[region].stations; // get all station on region
                    for (var station in sts) {
                        
                        var markerCoords = sts[station].geo; // get station's coordinates
                        var m_title = 'marker' + station; // name for marker
                        $scope.stations.push({
                            "Name": regions[region].name,
                            "Address": sts[station].address,
                            "latitude": markerCoords.lat,
                            "longitude": markerCoords.lng,
                            "OpenNow" : 1,
                            "Prices" : ""
                        });
                        m_title = new google.maps.Marker({
                                                             position: markerCoords,
                                                             type: region,
                                                             id: station,
                                                             address: sts[station].address,
                                                             lat: markerCoords.lat,
                                                             lng: markerCoords.lng,
                                                             icon: 'img/pins/pin.png',
                                                             typeMarker: 'gsm'
                                                         });
                                
                        $scope.markers.push(m_title); // add all marker in arr
                    }
                            
                    var mcOptions = {gridSize: 50, maxZoom: 16, styles: _clusterStyles, averageCenter: true}; // options for cluster
                    var mc = new MarkerClusterer(mapObj, $scope.markers, mcOptions); // init cluster
                }
                //_private.initStoreList(position);
            });
            /* end read data from json */
        };    
    }])
    .controller('menuController', ['$scope', 'templates', function($scope, templates) {
        $scope.templates = templates;
        $scope.setmenu = function(){
            debugger;
                $("#menu").kendoMenu();
        }
    }])
    .controller('cartController', ['$scope', 'templates', function($scope, templates){
        $scope.templates = templates;
    }]);