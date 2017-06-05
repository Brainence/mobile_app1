var sunoil_application = angular.module("sunoilMobileApp", []);

angular.module('sunoilMobileApp')
    .factory('globalFactory', function() {
        return {
            menuTemplate: $("#menuTemplate").html(),
            sunoilStationTemplate: $("#sunoilStationTemplate").html()
        };
    })
    .controller('mapController', [
                    '$scope', 'globalFactory', '$sce', function($scope, globalFactory, $sce) {
                        var _map;
                        var _styleArray = [{"stylers":[{"saturation":-100},{"gamma":1}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"on"},{"saturation":50},{"gamma":0},{"hue":"#50a5d1"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.fill","stylers":[{"color":"#333333"}]},{"featureType":"road.local","elementType":"labels.text","stylers":[{"weight":0.5},{"color":"#333333"}]},{"featureType":"transit.station","elementType":"labels.icon","stylers":[{"gamma":1},{"saturation":50}]}]
                        var _clusterStyles = [{height:64,width:64,url:"img/pins/m1.png",textColor:"white"},{textColor:"white",height:90,width:90,url:"img/pins/m2.png"},{textColor:"white",height:90,width:90,url:"img/pins/m2.png"},{textColor:"white",height:90,width:90,url:"img/pins/m2.png"},{textColor:"white",height:90,width:90,url:"img/pins/m2.png"}];
                        var _stations = [];
                        var _markers = [];
                        $scope.globalFactory = globalFactory;
                        $scope.map = _map;
                        $scope.stations = _stations;
                        $scope.markers = _markers;
                        $scope.infowindow;
                        $scope.myLocation;
                        $scope.directionsService;
                        $scope.directions;
                        $scope.directionsDisplay;
                        $scope.routeDetails = "";
                        $scope.routeCompleteDetails = "";
                        $scope.regions = ['fgsd','afas'];
                        
                        $scope.initMap = function() {
                            _map = document.getElementById("main-map");
                            latlng = new google.maps.LatLng(49.082586, 31.227971);
                            myOptions = {
                                zoom: 6,
                                center: latlng,
                                mapTypeControl: false,
                                navigationControlOptions: { style: google.maps.NavigationControlStyle.SMALL },
                                mapTypeId: google.maps.MapTypeId.ROADMAP,
                                styles: _styleArray,
                                zoomControlOptions: {
                                    style: google.maps.ZoomControlStyle.DEFAULT,
                                    position: google.maps.ControlPosition.RIGHT_CENTER
                                }
                            };
			    
                            $scope.map = new google.maps.Map(_map, myOptions);
                            $scope.infoWindow = new google.maps.InfoWindow({disableAutoPan: true});
            
                            $scope.refreshMap();
                            $scope.getMyLocation();
                            $scope.initializeRouteProviders();
                        };
                        $scope.refreshMap = function() {
                            /* read data from json */
                            jQuery.getJSON("http://sunoil.org/data.json", function (data) {
                                var average_prices = data.average_prices; // get abj average price from all regions

                                var regions = data.regions; // get obj with all regions
                                $scope.regions = regions;
                                $scope.$apply();
                                for (var region in regions) {
                                    var stations = regions[region].stations; // get all station on region
                                    for (var station in stations) {
                                        var markerCoords = stations[station].geo; // get station's coordinates
                                        var m_title = 'marker' + station; // name for marker
                                        m_title = new google.maps.Marker({
                                                                             position: markerCoords,
                                                                             type: region,
                                                                             id: station,
                                                                             address: stations[station].address,
                                                                             lat: markerCoords.lat,
                                                                             lng: markerCoords.lng,
                                                                             icon: 'img/pins/pin.png',
                                                                             typeMarker: 'gsm'
                                                                         });

                                        m_title.addListener('click', function (sender) {
                                            var currentPinLocation = {lat:sender.latLng.lat(), lng:sender.latLng.lng()};
                                            jQuery(".block_prises .wrap").removeClass('main');
                                            jQuery('.block_price').remove(); //remove old prices
                                            var iwContent = '<p>' + this.address + '</p><a href="#" onclick=\'runRouteTask(' + JSON.stringify(currentPinLocation) + ')\'>Будувати маршрут</a>'; 
                                            $scope.infoWindow.setContent(iwContent); // set address in windows info
                                            $scope.infoWindow.open($scope.map, this);
                                            $scope.map.setCenter({lat: this.lat, lng: this.lng}); //set center on coordinates marker
                                            smoothZoom($scope.map, 12, $scope.map.getZoom()); // call smoothZoom, parameters map, final zoomLevel, and starting zoom level
                                            
                                            var pric = data.station_prices[this.id]; // get all info from marker
                                            var count = 0;
                                            /*  show price for some station */
                                            for (var key in pric) {
                                                var name_gsm = data.types_gsm[key];
                                                var price_gsm = pric[key];
                                                jQuery(".block_prises .wrap").append('<div class= "block_price"><div class="price">' + price_gsm.toFixed(2) + '</div><div class="name">' + name_gsm + '</div></div>');
                                                count++;
                                            }
                                            /*  end show price for some station */
                                            
                                            animatePrise(jQuery('.block_prises .block_price'), '.price'); // after load all prices, do animate prices
                                        });
                                        $scope.markers.push(m_title); // add all marker in arr
                                    }

                                    var mcOptions = {gridSize: 50, maxZoom: 16, styles: _clusterStyles, averageCenter: true}; // options for cluster
                                    var mc = new MarkerClusterer($scope.map, $scope.markers, mcOptions); // init cluster
                                }
                            });
                            
                            var geocoder = new google.maps.Geocoder();

                            jQuery('.tabs .start_search').click(function() {
                                geocodeAddress(geocoder, $scope.map, jQuery('.tabs .search_field').val());
                            });

                            function geocodeAddress(geocoder, resultsMap, address) {
                                var address = address;
                                for (var i = 0; i < $scope.markers.length; i++) {
                                    if ($scope.markers[i].typeMarker == 'here')
                                        $scope.markers[i].setMap(null);
                                }
                                geocoder.geocode({'address': address}, function (results, status) {
                                    if (status === google.maps.GeocoderStatus.OK) {
                                        resultsMap.setCenter(results[0].geometry.location);
                                        var marker = new google.maps.Marker({
                                                                                map: resultsMap,
                                                                                position: results[0].geometry.location,
                                                                                typeMarker: 'here'
                                                                            });
                                        $scope.map.setZoom(11);
                                        $scope.markers.push(marker);
                                    } else {
                                        //  alert('Geocode was not successful for the following reason: ' + status);
                                    }
                                });
                            }

                            if (window.location.pathname == '/gas-stations-map') {
                                var autocompleteFrom = new google.maps.places.Autocomplete(jQuery("#from")[0], {});
                                var autocompleteTo = new google.maps.places.Autocomplete(jQuery("#to")[0], {});
                                var autocomplete = new google.maps.places.Autocomplete(jQuery("#search_field")[0], {});
                                autocomplete.bindTo('bounds', $scope.map);
                                autocompleteFrom.bindTo('bounds', $scope.map);
                                autocompleteTo.bindTo('bounds', $scope.map);

                                /*            jQuery('#search_field').focus(function(){

                                var coords = map.getCenter();
                                var biasCircle = new google.maps.Circle({
                                center:{lat: coords.lat(), lng: coords.lng()},
                                radius: 100
                                })//in kilometers
                                autocomplete.setBounds(biasCircle.getBounds());

                                autocomplete.setBounds(map.getBounds());
                                console.log('autocomplete bounds (after): ' + autocomplete.getBounds());
                                });*/

                                jQuery('#build_directions #from').attr('placeholder', '');
                                jQuery('#build_directions #to').attr('placeholder', '');
                            }

                            jQuery('.show').click(function() {
                                var address1 = jQuery('#build_directions #from').val();
                                var address2 = jQuery('#build_directions #to').val();
                                directionsDisplay.setMap(null);
                                for (var i = 0; i < $scope.markers.length; i++) {
                                    if ($scope.markers[i].typeMarker == 'dir') {
                                        $scope.markers[i].setMap(null);
                                    }
                                }
                                var icons = {
                                    start: new google.maps.MarkerImage(
                                        '/modules/mod_map/images/icon_from.png',
                                        new google.maps.Size(20, 20),
                                        new google.maps.Point(0, 0),
                                        new google.maps.Point(10, 10)
                                        ),
                                    end: new google.maps.MarkerImage(
                                        '/modules/mod_map/images/icon_to.png',
                                        new google.maps.Size(21, 27),
                                        new google.maps.Point(0, 0),
                                        new google.maps.Point(0, 27)
                                        )
                                };

                                // Set destination, origin and travel mode.
                                var request = {
                                    destination: address2,
                                    origin: address1,
                                    travelMode: 'DRIVING'
                                };

                                // Pass the directions request to the directions service.
                                var directionsRenderer;
                                directionsService.route(request, function(response, status) {
                                    if (directionsRenderer) {
                                        directionsRenderer.setMap(null);
                                    }
                                    if (status == google.maps.DirectionsStatus.OK) {
                                        directionsRenderer = new google.maps.DirectionsRenderer();
                                        directionsDisplay.set('directions', null);
                                        directionsDisplay.setDirections(response);
                                    }
                                });
                            });
                        }

                        $scope.getMyLocation = function() {
                            navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
                        }
                        
                        var geolocationSuccess = function(position) {
                            $scope.myLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                            
                            var m_title = new google.maps.Marker({
                                                                     position: $scope.myLocation,
                                                                     id: 'mylocation',
                                                                     map: $scope.map,
                                                                     lat: position.coords.latitude,
                                                                     lng: position.coords.longitude,
                                                                     typeMarker: 'gsm'
                                                                 });
                            $scope.map.setCenter({lat: position.coords.latitude, lng: position.coords.longitude}); //set center on coordinates marker
                            smoothZoom($scope.map, 8, $scope.map.getZoom()); // call smoothZoom, parameters map, final zoomLevel, and starting zoom level
                        }
                        
                        var geolocationError = function(error) {
                            alert('Не вдалося визначити точну локацію :(');
                            //for simulator only
                            /*$scope.myLocation = new google.maps.LatLng(49.853931, 24.037796);
                            var m_title = new google.maps.Marker({
                            position: $scope.myLocation,
                            id: 'mylocation',
                            map: $scope.map,
                            lat: 49.853931,
                            lng: 24.037796,
                            typeMarker: 'gsm'
                            });
                            $scope.map.setCenter({lat: 49.853931, lng: 24.037796}); //set center on coordinates marker
                            smoothZoom($scope.map, 8, $scope.map.getZoom()); // call smoothZoom, parameters map, final zoomLevel, and starting zoom level*/
                            //for simulator only
                        }
                        $scope.initializeRouteProviders = function() {
                            $scope.directionsService = new google.maps.DirectionsService();
                            $scope.directions = new google.maps.DirectionsRenderer({suppressMarkers: true});
                            $scope.directionsDisplay = new google.maps.DirectionsRenderer();
                            $scope.directionsDisplay.setMap(null);
                        }
                        $scope.buildRouteToPin = function (pin) {
                            $scope.clearRoutes();
                            $scope.directionsDisplay = new google.maps.DirectionsRenderer({
                                                                                              map: $scope.map,
                                                                                              suppressMarkers : true,
                                                                                              polylineOptions: { strokeColor: "#FF5000" }
                                                                                          });
    
                            if (!$scope.myLocation) {
                                alert('Не вдалось отримати вашу локацію для побудови шляху, оновіть вашу локацію');
                                return;
                            }
                            if (pin) {
                                var start = $scope.myLocation;
                                var end = new google.maps.LatLng(pin.lat, pin.lng);
                                var request = {
                                    origin: start,
                                    destination: end,
                                    travelMode: google.maps.TravelMode.DRIVING
                                };
                                $scope.directionsService.route(request, function(result, status) {
                                    if (status == google.maps.DirectionsStatus.OK) {
                                        $scope.directionsDisplay.setDirections(result);
                                        $scope.infoWindow.close();

                                        if (result && result.routes[0] && result.routes[0].legs[0]) {
                                            $scope.routeDetails = result.routes[0].legs[0].distance.text;
                                            var generatedDetails = "";
                                            $.each(result.routes[0].legs[0].steps, function(ind, val) {
                                                generatedDetails += '<p>' + val.instructions + '</p>';
                                            })
                                            $scope.routeCompleteDetails = $sce.trustAsHtml(generatedDetails);
                                            $scope.$apply();
                                            $("#routeDetailsBlock").show();
                                        }
                                    } else {
                                        alert("couldn't get directions:" + status);
                                    }
                                });
                            }
                        }
                        
                        $scope.clearRoutes = function() {
                            $scope.directionsDisplay.setMap(null);
                            $("#routeDetailsBlock").hide();
                        }
                        $scope.showSelectedStationOnMap = function(station) {
                            var showOnMap = confirm("Показати станцію на карті?");
                            if (showOnMap == true) {
                                $.each($scope.markers, function(ind, val) {
                                    if (station.address == val.address) {
                                        $.mobile.navigate("#map");
                                        $scope.centerMapOnPin(val);
                                    }
                                });
                            }                            
                        }
                        $scope.centerMapOnPin = function(pin) {
                            debugger;
                            if (pin) {
                                $scope.map.setCenter({lat: pin.position.lat(), lng: pin.position.lng()}); //set center on coordinates marker
                                smoothZoom($scope.map, 12, $scope.map.getZoom()); // call smoothZoom, parameters map, final zoomLevel, and starting zoom level
                            }
                        }
                    }
                ])
    .controller('menuController', [
                    '$scope', 'globalFactory', function($scope, globalFactory) {
                        $scope.globalFactory = globalFactory;
                        $scope.setmenu = function() {
                            $("#menu").kendoMenu();
                        }
                    }
                ])
    .controller('cartController', [
                    '$scope', 'globalFactory', function($scope, globalFactory) {
                        $scope.globalFactory = globalFactory;
                    }
                ]);

function animatePrise(block, num) {
    var decimal_places = 2;
    var decimal_factor = decimal_places === 0 ? 1 : Math.pow(10, decimal_places);
    $ = jQuery;
    $(block).each(function() {
        var price = $(this).find(num);
        var price_num = $(this).find(num).text();
        price.animateNumber({
                                number: Math.round(price_num * decimal_factor),

                                numberStep: function(now, tween) {
                                    var floored_number = Math.floor(now) / decimal_factor,
                                        target = jQuery(tween.elem);

                                    if (decimal_places > 0) {
                                        // force decimal places even if they are 0
                                        floored_number = floored_number.toFixed(decimal_places);
                                    }
                                    target.text(floored_number);
                                }
                            },
                            1500
            );
    });
}
/*$scope.refreshMap = function(){
$scope.markers = [];
           
jQuery.getJSON("http://sunoil.org/data.json", function (data) {
                
var average_prices = data.average_prices; // get abj average price from all regions

           
for (var key in average_prices) {
var name_gsm = data.types_gsm[key];
var price_gsm = average_prices[key];
jQuery(".block_prises .wrap").addClass('main'); // add class for hide block 'prices' on page 'gas stations map'
jQuery(".block_prises .wrap").append('<div class= "block_price"><div class="price">' + price_gsm.toFixed(2)  + '</div><div class="name">' + name_gsm + '</div></div>');

}
           
                
animatePrise(jQuery('.block_prises .block_price'), '.price' );  // after load all prices, do animate prices
                
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
           
};*/    