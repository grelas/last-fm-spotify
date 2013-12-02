/*
 * main.js
 * kettle namespace
 */

 var kettle = {};

 kettle.shell = (function () {
	"use strict";

	// Static configuration values
	var configMap = {
		last_fm : {
			apiKey   : '5c66dde901367412ebee47ff5b7b47c1',
			apiSecret: '3fa3b31b0f3d2fa405012b7be8d4bb42'
		},
		user_list: [
			'alanchais', 'deadfinch', 'grlaspin'
		],
		tracks_count : 9,
		tracks_period: '3month'
	},

	// Cache jQuery collections
	jqueryMap = {},

	// Delcare all module scope variables 
	getUserTrack,
	getTopTracks,
	createTracksNode,
	newFetch,
	fetchUserTracks,
	setJqueryMap,
	fetchTracks,
	shuffle,
	initModule;

	shuffle = function( array ) {
		var currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while ( 0 !== currentIndex ) {

		// Pick a remaining element...
		randomIndex = Math.floor( Math.random() * currentIndex );
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue        = array[ currentIndex ];
		array[ currentIndex ] = array[ randomIndex ];
		array[ randomIndex ]  = temporaryValue;
		}

		return array;
	};

	setJqueryMap = function(){
		jqueryMap = {
			$loading: $('.loading')
		};
	};

	createTracksNode = function( arr ){
		var tracks, tracks_len, i, track_img, $li;

		tracks = arr;
		tracks_len = tracks.length;

		for( i = 0; i < tracks_len; i += 1 ){
			var _track_img, _data_track_url;

			if( tracks[i].image ){
				_track_img = tracks[i].image[3]["#text"];
				_data_track_url = tracks[i].url;

				$li = $('<li class="track"><a href="' + _data_track_url + '"><img src="' + _track_img + '" alt="#" /><div class="overlay"></div><h3 class="track_name">' + tracks[i].name + '</h3></a></li>');
				$('.tracks').append( $li );
			} else {
				console.log( 'One of the tracks doesn\'t have an image!' );
			}
		}
		jqueryMap.$loading.hide();
		console.log(' -- hide loading');

	};

	getTopTracks = function( user ){
		var deferred, last_fm;

		deferred = when.defer();

		last_fm = new LastFM({
			apiKey    : configMap.last_fm.apiKey,
			apiSecret : configMap.last_fm.apiSecret
		});

		last_fm.user.getTopTracks({
			user   : user,
			period : configMap.tracks_period,
			limit  : configMap.tracks_count
		}, {
			success: function( data ){
				var track_arr;
				track_arr = data.toptracks.track;
				deferred.resolve(track_arr);
				//callback( track_arr );
				//deferred.resolve( track_arr );
				//console.log('no error');
			},
			error: function( code, message ){
				console.log( 'Error in getting tracks.' );
				//console.log( code );
				deferred.reject(code);
			}
		});

		return deferred.promise;

	};


	newFetch = function(){
		var user_list_len, cpt, i, deferred, promises = [];
		user_list_len = configMap.user_list.length;

		deferred = when.defer();

		configMap.user_list.forEach(function( user ){
			promises.push( getTopTracks( user ) );
		});

		when.all(promises, function( results ){
			// results will be an array of track_arr
			deferred.resolve(results);
		}, function(error){
			deferred.reject(error);
		});

		return deferred.promise;
	};

	fetchTracks = function(){
		var get_tracks = newFetch();

		get_tracks.done(function( results ){
			var tracks_arr, i, tracks_arr_len, new_arr = [];

			tracks_arr = results;
			tracks_arr_len = tracks_arr.length;

			for( i = 0; i < tracks_arr_len; i++ ){
				new_arr.push.apply( new_arr, tracks_arr[ i ] );
			}

			createTracksNode( shuffle( new_arr ) );

		}, function( error ){
			// handle error
			console.log( error );
		});
	};

	// Begin public methods
	initModule = function(){
		setJqueryMap();
		fetchTracks();
	};

	// Export public methods explicitly by returning them in a map
	return {
		initModule: initModule
	};

}());

// DOM Ready
$(function() {
	kettle.shell.initModule();
});