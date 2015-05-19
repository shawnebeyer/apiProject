//Please excuse the commented out nonsense. I have a tendancy to want to go back to see "what this does".
//I really need to get back to this and clean up the dribble.

var app = {};

function getDate() {
 var date = new Date();
 var day = date.getDate().toString();
 var year = date.getFullYear().toString();
 var month = function() {
   if(date.getMonth().toString().length === 1) {
     return '0' +  date.getMonth();
   }
   else {
     return date.getMonth();
   }
 }
 return year + month().toString() + day;
}
app.parksList = [];
// Geolocator
app.lat = '';
app.lng = '';
app.venueLat = '';
app.venueLng = '';
app.getLocation = function() {
	//Askes user to allow us to get their current position
	navigator.geolocation.getCurrentPosition(function(pos) {
		app.lat = pos.coords.latitude;
		app.lng = pos.coords.longitude;
		app.events();
	});
};


// Get our venue information based on user search
app.getFood = function(foodItem) {
	// console.log('foodItem is' + foodItem);
	$.ajax({
		url: 'https://api.foursquare.com/v2/venues/explore/',
		type: 'GET',
		datatype: 'jsonp',
		data: {
			client_id: '4SMGGYCPXWGPZRECIRHP14VGBT2T40I4W1BR5DRUVQERWA3S',
			client_secret: 'XZFODOUVWBQR1X3DGLGT51WBUZXDUEEMZ0MPFCHTTZLOH011',
			v: getDate(),
			ll: app.lat + ',' + app.lng,
			query: foodItem,
			limit: 50,
			sortByDistance: 1,
			openNow : true,
			venuePhotos: 1
		},
		success: function(venue) {
			//PROBLEM - these two variable correctly hold the venue's lat and lng coords seperately, but when
			//generated on screen, they only apply to the first venue return. variables should be given values in
			//each loop below, but how can I keep each value through the loop and apply it to a venue????
			if (venue.response.groups[0].items.length === 0) {
				var $lunchFromHomeThen = $('<p class="noFoodForYou animated bounce">').text("Oh no! Looks like you might have to raid your parents fridge! There doesn't appear to be any open restaurants near you that have what you're looking for today. Try searching again!");
				$('#container').append($lunchFromHomeThen);
				// $('#container').empty();
			} else {
				// make another else statement to handle if less than 5 venues are populated. Add a class to re style it.
			app.venueLat = venue.response.groups[0].items[0].venue.location.lat;
			app.venueLng = venue.response.groups[0].items[0].venue.location.lng;
			app.displayFood(venue.response.groups[0].items);
			}
		}
	});
};

// Display venue information
app.displayFood = function(foodVenue) {
	$('#container').empty();
	// var places = foodVenue;
	// console.log(foodVenue);
	// if (places.length === 0) {
	// 	var $lunchFromHomeThen = $('<p>').text("Oh no! We hope you're brown baggin' it today. There aren't any open restaurants near you that have whgat you're looking for");
	// 	$('#container').append($lunchFromHomeThen);
	// }
	// 	//if there aren't any results, display this message to the user
	// 	if (places.length === 0) {
	// 			var zilch = $('<h4>').text("Uh oh.  It looks like there aren't any open places near you that have guac.");
	// 			$('section.results').append(zilch);
	// 	}


	//Beginning of each loop - loops through our venue options.
	$.each(foodVenue, function(i, item) {
		var photoSize = '100x100';
		var $venueLocation = item.venue.location.lat + ',' + item.venue.location.lng;
		var $venueLattitude = item.venue.location.lat;
		var $venueLongitude = item.venue.location.lng;
		var $dist = '';
		var $venueAddress = $('<p class="address">').text(item.venue.location.address);
		var $venueName = $('<h2>').text(item.venue.name);
		var $venueHours = $('<p>').text(item.venue.hours.status);
		// var $venueIsOpen = $('<p>').text(item.venue.hours.isOpen);
		var $venueURL = $('<a>').attr('href', item.venue.url).text(item.venue.name);
		var $venuePhotos = $('<img>').attr('src',item.venue.photos.groups[0].items[0].prefix + photoSize + item.venue.photos.groups[0].items[0].suffix);
		// if distance from current location is more than 1000m, convert it to km and attach different concatenation to add to page
			if (item.venue.location.distance > 1000) {
				$dist = $('<p class="dist">').text('You are '+ ((item.venue.location.distance/1000).toFixed(1)) + 'km away.');
			} else {
				$dist = $('<p class="dist">').text('You are ' + item.venue.location.distance + 'm away.');
			}
		var $lunchChoice = $('<div>').addClass('lunchChoice').append($venuePhotos, $venueName, $venueAddress, $venueURL, $dist);
		$('.lunchChoice').addClass('clearfix');
		$('.returnInfo').addClass('returnInfoBackground');
		$lunchChoice.data('latlng', $venueLocation);
		$lunchChoice.data('lat', $venueLattitude);
		$lunchChoice.data('lng', $venueLongitude);
		$('#container').append($lunchChoice);

		console.log(item);
		// console.log(item);
	}); //End of each loop
};

app.venueEvents = function() {
	//make this draggable?
	//on drag/on drop
	$('#container').on('click','.lunchChoice', function() {
		var $venueLatLng = $(this).data('latlng');
		var $venuesLat = $(this).data('lat');
		var $venuesLng = $(this).data('lng');
		console.log($venuesLat)
		//THIS is an attempt to make venue results draggable and droppable on map canvas. Will get to this!!
		// $(function() {
		//             $( ".lunchChoice" ).draggable({scroll: false});
		//             $("#map-canvas").droppable({
		//                drop: function (event, ui) {
		//                $( this )
		//                .addClass( "ui-state-highlight" )
		//                app.getParks($venueLatLng, $venuesLat, $venuesLng);
		//                },   
		//                over: function (event, ui) {
		//                $( this )
		//                .addClass( "ui-state-highlight" )
		//                .find( "p" )
		//                .html( "moving in!" );
		//                },
		//                out: function (event, ui) {
		//                $( this )
		//                .addClass( "ui-state-highlight" )
		//                .find( "p" )
		//                .html( "moving out!" );
		//                }      
		//             });
		//             $('#map-canvas').empty();
		//          });
		app.getParks($venueLatLng, $venuesLat, $venuesLng);
	});
}

// This function will get our parks information
app.getParks = function(venueLocation, venuesLatitude, venuesLongitude) {
	$.ajax({
		url: 'https://api.foursquare.com/v2/venues/explore/',
		type: 'GET',
		datatype: 'jsonp',
		data: {
			client_id: '4SMGGYCPXWGPZRECIRHP14VGBT2T40I4W1BR5DRUVQERWA3S',
			client_secret: 'XZFODOUVWBQR1X3DGLGT51WBUZXDUEEMZ0MPFCHTTZLOH011',
			v: getDate(),
			ll: venueLocation,
			section: 'outdoors',
			query: 'park',
			limit: 20,
			radius: 1000,
			venuePhotos: 1
		},
		success: function(venue) {
			//venue now holds the park objects ive asked for in this call.
			// app.displayParks(venue.response.groups[0]['items'], venue.response.groups[0].items[0].venue.location.lat, venue.response.groups[0].items[0].venue.location.lng);
			app.displayParks(venue.response.groups[0]['items'], venuesLatitude, venuesLongitude);
			// app.displayParks(venue.response.groups[0].items[0].venue.location.lat);
			// app.displayParks()
			// console.log(venue.response.groups[0].items[0].venue.location.lat);
			// console.log(venue.response.groups[0].items[0].venue.location.lng);
		}
	});
}


// This function will get each parks coords and information
// app.displayParks = function(park, parkLat, parkLng) {
app.displayParks = function(park, vlat, vlng) {
//park is all the parks info
	$.each(park, function(i, item) {
		// var parkCoords = item.venue.location.lat + "," + item.venue.location.lng;
		//call google and display map with each parkCoords
		var park = {
			coords: {
				lat: item.venue.location.lat,
				lng: item.venue.location.lng
			},
			name: item.venue.name
		}
		// app.parksList.push(park);
		// or
		app.parksList.push(park.coords);
		// // or
		// app.parksList.push(park.coords.lat);
		// app.parksList.push(park.coords.lng);
	});
	// app.getMap(app.parksList, parkLat, parkLng);
	app.getMap(app.parksList, vlat, vlng);
};


//Display map, centered on user, and show closest parks with markers
//Dont really need parkLat and parkLng
// app.getMap = function(closestParks, parkLat, parkLng) {
app.getMap = function(closestParks, vlat, vlng) {
	console.log(closestParks);
	console.log(app.venueLat, app.venueLng);
	// console.log(parkLat, parkLng);
        var mapOptions = {
        	center: {lat: vlat, lng: vlng},
        	// center: new google.maps.LatLng(venueLocation),
          	zoom: 15,
          	streetViewControl: true
        };
        var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        map.setTilt(45);
        var venueImage = 'images/map.png';
        //Sets marker on venue selected's location
        var marker = new google.maps.Marker({
              position: {lat: vlat, lng: vlng},
              map: map,
              title: 'Eat here!',
              icon: venueImage
          });

 		//Loops through the closestParks Array and use each value to put a marker on the map.	
        $.each(closestParks, function(i, item) {
        	var parkImage = 'images/parks.svg';
        	var marker = new google.maps.Marker({
        	      position: item,
        	      map: map,
        	      title: "I'm a park!",
        	      draggable:true,
        	      animation: google.maps.Animation.DROP,
        	      icon: parkImage
        	      // position: item
        	  });

        });
      }

app.events = function() {
	//apply an event listener to the form with a class of search
	$('.search').on('submit', function(ev){
		ev.preventDefault();
		//change up some of the page's styling
		// $( "ul li a.character1" ).addClass( "funkyLinks1 funkyLinks" );
		// $("h1").addClass("test");
		// $(".wrapper").addClass("flexBoxRow transition");
		// $('.begin').addClass('animated fadeOutLeft');
		// $('h1').addClass('animated fadeOutRight');
		// $('.wrapper').addClass('remove');
		// $(".wrapper").removeClass("remove").delay(1000).queue(function(next){
		//     $(".wrapper").addClass("remove");
		//     next();
		// });
		//now we need to get the user's input
		var searchQuery = $(this).find('input[type=search]').val();
		//pass that value to the app.getArt() method
		app.getFood(searchQuery);
		//Clear the search value - this clears the search bar by passing an empty string to the .val
		$(this).find('input[type=search]').val('');
	});
};

app.init = function() {
	app.getLocation();
	app.venueEvents();
	// $(".containerFixed").sticky({topSpacing:0});
};

$(function() {
	app.init();
});