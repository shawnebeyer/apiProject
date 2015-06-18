

var app = {};



/////////////////////////////////////////////////////////////////////////////////////
//GETS DATE TO INPUT IN OUR FOURSQUARE AJAX CALL (THEY NEED A CURRENT VERSION TO RUN)
/////////////////////////////////////////////////////////////////////////////////////

function getDate() {
 var date = new Date();
 var day = (function() {
 	var newDate = date.getDate().toString();
 	if (newDate.length ===1 ) {
		return '0' + newDate;
 	}
 	else {
 		return newDate;
 	}
})()
 var year = date.getFullYear().toString();
 var month = (function() {
   if(date.getMonth().toString().length === 1) {
     return '0' +  date.getMonth();
   }
   else {
     return date.getMonth();
   }
 })();
 return year + month + day;
}
app.parksList = [];




///////////////////////////////////////////////
//START GEOLOCATOR TO GET USERS GPS COORDINATES
///////////////////////////////////////////////

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




//////////////////////////////////////////////
// GETS VENUE INFORMATION BASED ON USER SEARCH
//////////////////////////////////////////////

app.getFood = function(foodItem) {
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
		
			if (venue.response.groups[0].items.length === 0) {
				var $lunchFromHomeThen = $('<p class="noFoodForYou animated bounce">').text("Oh no! Looks like you might have to raid your parents fridge! There doesn't appear to be any open restaurants near you that have what you're looking for today. Try searching again!");
				$('#container').append($lunchFromHomeThen);
			} else {
				// make another else statement to handle if less than 5 venues are populated. Add a class to re style it.
			app.venueLat = venue.response.groups[0].items[0].venue.location.lat;
			app.venueLng = venue.response.groups[0].items[0].venue.location.lng;
			app.displayFood(venue.response.groups[0].items);
			}
		}
	});
};




/////////////////////////////
// DISPLAYS VENUE INFORMATION
/////////////////////////////

app.displayFood = function(foodVenue) {
	$('#container').empty();
	app.checkSize();

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
	}); //End of each loop
};

app.venueEvents = function() {
	//make this draggable?
	//on drag/on drop
	$('#container').on('click','.lunchChoice', function() {
		var $venueLatLng = $(this).data('latlng');
		var $venuesLat = $(this).data('lat');
		var $venuesLng = $(this).data('lng');
		// console.log($venuesLat)
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
			app.displayParks(venue.response.groups[0]['items'], venuesLatitude, venuesLongitude);
		}
	});
}


// This function will get each parks coords and information
app.displayParks = function(park, vlat, vlng) {
//park is all the parks info
	$.each(park, function(i, item) {
		//call google and display map with each parkCoords
		var park = {
			coords: {
				lat: item.venue.location.lat,
				lng: item.venue.location.lng
			},
			name: item.venue.name
		}
		app.parksList.push(park.coords);
	});
	app.getMap(app.parksList, vlat, vlng);
};


//Display map, centered on user, and show closest parks with markers
//Dont really need parkLat and parkLng
app.getMap = function(closestParks, vlat, vlng) {
	console.log(closestParks);
	console.log(app.venueLat, app.venueLng);
        var mapOptions = {
        	center: {lat: vlat, lng: vlng},
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
        	  });

        });
      }

app.events = function() {
	//apply an event listener to the form with a class of search
	$('.search').on('submit', function(ev){
		ev.preventDefault();
		//change up some of the page's styling
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
};

app.checkSize = function() {

	if ($(".containerHalf").css("min-width") == "100%" ){
	        // $("#map-canvas")
	        //     .appendTo(".containerList");
	        console.log('heheh');
	        // $('.mobileMap').append( $('#map-canvas') );
	        // $('')
	        $()
	    }

	 if ($(".containerHalf").css("height") == "150vh" ){
	         // $("#map-canvas")
	         //     .appendTo(".containerList");
	         console.log('yaaaa');
	         // $('.mobileMap').append( $('#map-canvas') );
	         // $('')
	         $()
	     }
};

$(function() {
	app.init();
});