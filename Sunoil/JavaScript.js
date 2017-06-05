    function initMap() {


        /* read data from json */
        jQuery.getJSON("/data.json", function (data) {

           var average_prices = data.average_prices; // get abj average price from all regions

            var regions = data.regions; // get obj with all regions
            for (var region in regions) {

                                    jQuery(".select_region").append('<li data-region =' + region + '>' + regions[region].name + '</li>'); // add region on block for select regions
                
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
                        icon: '/modules/mod_map/images/pin.png',
                        typeMarker: 'gsm'
                    });

                    m_title.addListener('click', function () {
                        jQuery(".block_prises .wrap").removeClass('main');
                        jQuery('.block_price').remove(); //remove old prices
                        map.setCenter({lat: this.lat, lng: this.lng}); //set center on coordinates marker
                        map.setZoom(14); //  set zoom
                        infoWindow.setContent(this.address); // set address in windows info
                        infoWindow.open(map, this);
                        var pric = data.station_prices[this.id]; // get all info from marker
                        var count = 0;
                        /*  show price for some station */
                        for(var key in pric){
                            var name_gsm = data.types_gsm[key];
                            var price_gsm = pric[key];
                            jQuery(".block_prises .wrap").append('<div class= "block_price"><div class="price">' + price_gsm.toFixed(2) + '</div><div class="name">' + name_gsm + '</div></div>');
                            count++;
                        }
                        /*  end show price for some station */

                        // add class 'four' - max prices in row 4, remove class 'four' - max prices in row 5
                        if(count>=6 && count<=8){
                            jQuery('.block_prises').addClass('four');
                        }
                        else{
                            jQuery('.block_prises').removeClass('four');
                        }

                        animatePrise(jQuery('.block_prises .block_price'), '.price' ); // after load all prices, do animate prices
                    });
                    markers.push(m_title); // add all marker in arr


                }

                var mcOptions = {gridSize: 50, maxZoom: 16, styles: clusterStyles, averageCenter: true}; // options for cluster
                var mc = new MarkerClusterer($scope.map, $scope.markers, mcOptions); // init cluster
            }

                    jQuery('#select_region li').click(function () {
               jQuery(".block_prises .wrap").removeClass('main');
               mc.clearMarkers();
                infoWindow.close();
                jQuery(this).siblings().removeClass('chosen');
                jQuery(this).addClass('chosen');
                jQuery('.selected_item').html(jQuery(this).text());
                jQuery('.selected_item').removeClass('open');
                jQuery(this).parent().slideUp(500);
                jQuery('.block_price').remove();
                var maxLat = 0;
                var maxLng = 0;
                var minLat = 0;
                var minLng = 0;
                //get center map from visible points
                var count = 0;
                for (var i = 0; i < markers.length; i++) {

                    if (jQuery(this).attr('data-region') == 'all') {
                       /* markers[i].setVisible(true);*/
                       // map.setZoom(6);
                        if (markers[i].lat > maxLat) {
                            maxLat = markers[i].lat;
                        }
                        if (markers[i].lng > maxLng) {
                            maxLng = markers[i].lng;
                        }
                        if (markers[i].lat < minLat || minLat == 0) {
                            minLat = markers[i].lat;
                        }
                        if (markers[i].lng < minLng || minLng == 0) {
                            minLng = markers[i].lng;
                        }
                    } else if (jQuery(this).attr('data-region') == markers[i].type) {
                       /* markers[i].setVisible(true);*/
                        if (markers[i].lat > maxLat) {
                            maxLat = markers[i].lat;
                        }
                        if (markers[i].lng > maxLng) {
                            maxLng = markers[i].lng;
                        }
                        if (markers[i].lat < minLat || minLat == 0) {
                            minLat = markers[i].lat;
                        }
                        if (markers[i].lng < minLng || minLng == 0) {
                            minLng = markers[i].lng;
                        }
                        map.setZoom(8);
                    } else {

                       /* markers[i].setVisible(false);*/
                        map.setZoom(8);
                    }

                }

                var centerLat = (minLat + maxLat) / 2.0;
                var centerLng = (minLng + maxLng) / 2.0;
                map.setCenter({lat: centerLat, lng: centerLng});
                if (jQuery(this).attr('data-region') != 'all'){
                    var region_prices = regions[jQuery(this).attr('data-region')].prices;
                    for (var key in region_prices) {
                        count++;
                        var name_gsm = data.types_gsm[key];
                        var price_gsm = region_prices[key];
                        jQuery(".block_prises .wrap").append('<div class= "block_price"><div class="price">' + price_gsm.toFixed(2)  + '</div><div class="name">' + name_gsm + '</div></div>');
                    }
                } else {
                    var average_prices = data.average_prices;
                    for (var key in average_prices) {
                        var name_gsm = data.types_gsm[key];
                        var price_gsm = average_prices[key];
                        jQuery(".block_prises .wrap").append('<div class= "block_price"><div class="price">' + price_gsm.toFixed(2)  + '</div><div class="name">' + name_gsm + '</div></div>');

                    }

                }

                if(count>=6 && count<=8){
                   jQuery('.block_prises').addClass('four');
                }
                else{
                    jQuery('.block_prises').removeClass('four');
                }
                animatePrise(jQuery('.block_prises .block_price'), '.price' );
            });
                    });
        /* end read data from json */
        var geocoder = new google.maps.Geocoder();

        jQuery('.tabs .start_search').click(function(){
            geocodeAddress(geocoder, map, jQuery('.tabs .search_field').val());
        });


        function geocodeAddress(geocoder, resultsMap, address) {
            var address = address;
            for (var i = 0; i < markers.length; i++) {
            if(markers[i].typeMarker == 'here')
                markers[i].setMap(null);
            }
                geocoder.geocode({'address': address}, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    resultsMap.setCenter(results[0].geometry.location);
                    var marker = new google.maps.Marker({
                        map: resultsMap,
                        position: results[0].geometry.location,
                        typeMarker: 'here'
                    });
                    map.setZoom(11);
                    markers.push(marker);
                } else {
                  //  alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        }

        if(window.location.pathname == '/gas-stations-map'){
            var autocompleteFrom = new google.maps.places.Autocomplete(jQuery("#from")[0], {});
            var autocompleteTo = new google.maps.places.Autocomplete(jQuery("#to")[0], {});
            var autocomplete = new google.maps.places.Autocomplete(jQuery("#search_field")[0], {});
            autocomplete.bindTo('bounds', map);
            autocompleteFrom.bindTo('bounds', map);
            autocompleteTo.bindTo('bounds', map);

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
        var directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setMap(null);

        jQuery('.show').click(function(){
            var directionsService = new google.maps.DirectionsService();
            var directions = new google.maps.DirectionsRenderer({suppressMarkers: true});

            var address1 = jQuery('#build_directions #from').val();
            var address2 = jQuery('#build_directions #to').val();
            directionsDisplay.setMap(null);
            for (var i = 0; i < markers.length; i++) {
                if (markers[i].typeMarker == 'dir') {
                    markers[i].setMap(null);
                }
            }
            var icons = {
                start: new google.maps.MarkerImage(
                    '/modules/mod_map/images/icon_from.png',
                    new google.maps.Size( 20, 20 ),
                    new google.maps.Point( 0, 0 ),
                    new google.maps.Point( 10, 10 )
                ),
                end: new google.maps.MarkerImage(
                    '/modules/mod_map/images/icon_to.png',
                    new google.maps.Size(21, 27),
                    new google.maps.Point( 0, 0 ),
                    new google.maps.Point( 0, 27 )
                )
            };




            directionsDisplay = new google.maps.DirectionsRenderer({
                map: map,
                suppressMarkers : true,
                polylineOptions: {
                    strokeColor: "#FF5000"
                }
            });


            // Set destination, origin and travel mode.
            var request = {
                destination: address2,
                origin: address1,
                travelMode: 'DRIVING'
            };

            // Pass the directions request to the directions service.
            var directionsRenderer;
            directionsService.route(request, function(response, status) {
                if(directionsRenderer){
                    directionsRenderer.setMap(null);
                }
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsRenderer = new google.maps.DirectionsRenderer();
                    directionsDisplay.set('directions', null);
                    directionsDisplay.setDirections(response);
                    var leg = response.routes[ 0 ].legs[ 0 ];
                    makeMarker( leg.start_location, icons.start, "title" );
                    makeMarker( leg.end_location, icons.end, 'title' );
                }
            });
            function makeMarker( position, icon, title ) {
                var marker = new google.maps.Marker({
                    position: position,
                    map: map,
                    icon: icon,
                    title: title,
                    typeMarker: 'dir'
                });
                markers.push(marker);

            }
        });
    }
    

