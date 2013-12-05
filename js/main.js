/*
 * main.js
 * kettle namespace
 */

 var kettle = {};

 kettle.lastfm = (function () {
  "use strict";

  // Static configuration values
  var configMap = {
    last_fm : {
      url: 'http://ws.audioscrobbler.com/2.0/',
      method_tracks: 'user.gettoptracks',
      method_user: 'user.getInfo',
      apiKey:'5c66dde901367412ebee47ff5b7b47c1',
      apiSecret:'3fa3b31b0f3d2fa405012b7be8d4bb42',
      user_list:['grlaspin', 'writethewrxng','opeyre','alanchais','deadfinch','hardenburger','monsonian','Glorman','JSchitty'],
      tracks_count: 3,
      tracks_period: 'overall',
      img_missing: 'img/blank.jpg'
    }
  },

  // Cache jQuery collections
  jqueryMap = {},

  // Delcare all module scope variables 
  util_shuffle,
  util_intersect,
  util_eliminateDup,
  setJqueryMap,
  fetchTracks,
  getTracks,
  outputDups,
  outputToDom,
  createTracksNode,
  getInfo,
  initModule;

  setJqueryMap = function(){
    jqueryMap = {
      $loading : $('.loading'),
      $ulTracks: $('.tracks'),
      $main: $('.main')
    };
  };

  util_shuffle = function( array ) {
    var i = array.length, temp, j;

    // While there remain elements to shuffle...
    while ( 0 !== i ) {

      // Pick a remaining element...
      j = Math.floor( Math.random() * i );
      i -= 1;

      // And swap it with the current element.
      temp        = array[ i ];
      array[ i ] = array[ j ];
      array[ j ]  = temp;
    }

    return array;
  };

  util_intersect = function( a, b ) {
    var ai = 0, bi = 0, result;
      result = [];

      while( ai < a.length && bi < b.length ) {
         if( a[ai] < b[bi] ){
          ai++;
        } else if( a[ai] > b[bi] ){
          bi++;
        } else {
           result.push( a[ai] );
           ai++;
           bi++;
         }
      }

    return result;
  };

  util_eliminateDup = function( arr ) {
    var i,
        len = arr.length,
        out = [],
        obj = {};
   
    for (i = 0; i < len; i++) {
      obj[arr[i]]=0;
    }
    for (i in obj) {
      out.push(i);
    }
    return out;
  };

  outputToDom = function( arr ){
    var track_arr, track_arr_count, track_single, track_user, track_name, track_img, i, j, track_ind, track_tracks_count, track_url, track_art, panel_width, $li, $tracks, $panel;
    panel_width = 0;
    track_arr = arr;
    track_arr_count = track_arr.length;

    for( i = 0; i < track_arr_count; i++) {
      track_single = track_arr[i];
      track_user = track_arr[i]['@attr'].user;
      track_tracks_count = track_arr[i].track.length;
      /*
      for( j = 0; j < track_tracks_count; j++ ){
        track_ind  = track_arr[i].track[j];
        track_name = track_ind.name;
        track_url  = track_ind.url;
        track_art  = track_ind.artist.name;

        if( track_ind.image ) {
          track_img = track_ind.image[3]['#text'];
        } else {
          console.log('no track image');
          track_img = configMap.last_fm.img_missing;
        }

        $li = $('<li class="track"><a href="' + track_url + '"><span class="user_name">' + track_user + '</span></div><div class="overlay"></div><div class="img"><img src="' + track_img + '" alt="#" /></div><div class="track_info"><h3 class="track_name">' + track_name + '</h3><h5 class="artist_name">' + track_art + '</h5></div></a></li>');
        jqueryMap.$ulTracks.append( $li );
      }
      */

      $panel = $('<div class="panel" data-panel-user=' + track_user + '">' + '<h1 class="user_name">' + track_user + '</h1>' + '<ul class="tracks_all"></ul></div>');
      jqueryMap.$main.append( $panel );

      for( j = 0; j < track_tracks_count; j++ ){
        track_ind  = track_arr[i].track[j];
        track_name = track_ind.name;
        track_url  = track_ind.url;
        track_art  = track_ind.artist.name;

        if( track_ind.image ) {
          track_img = track_ind.image[3]['#text'];
        } else {
          console.log('no track image');
          track_img = configMap.last_fm.img_missing;
        }
        $tracks = $('<li class="track"><a href="' + track_url + '" target="_blank"></div><div class="overlay"></div><div class="img"><img src="' + track_img + '" alt="#" /></div><div class="track_info"><h3 class="track_name">' + track_name + '</h3><h5 class="artist_name">' + track_art + '</h5></div></a></li>');
        $panel.find('.tracks_all').append( $tracks );

      }

    }


    $('.panel').each(function(){
        panel_width += $(this).outerWidth( true );
    });

    jqueryMap.$main.width( panel_width );

    
  };

  outputDups = function( arr ) {
    console.log( arr );
  };
  /*
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
        //console.log( 'One of the tracks doesn\'t have an image!' );
      }
    }
    jqueryMap.$loading.hide();
  };
  */

  getInfo = function( user ) {
    var dfd, url;
    url = configMap.last_fm.url + '?method=' + configMap.last_fm.method_user + '&user=' + user + '&api_key='+ configMap.last_fm.apiKey +'&format=json';
    dfd = $.Deferred();

    $.getJSON( url, function(a) {
      //console.log( "success" );
    })
    .done(function( results ) {
      dfd.resolve( results );
    })
    .fail(function( error ) {
      //console.log( "error" );
    });

    return dfd.promise();
  };

  getTracks = function( user ){
    var dfd, last_fm, last_fm_url;

    last_fm_url = configMap.last_fm.url + '?method=' + configMap.last_fm.method_tracks + '&user=' + user + '&limit='+ configMap.last_fm.tracks_count + '&period=' + configMap.last_fm.tracks_period + '&api_key='+ configMap.last_fm.apiKey +'&format=json';
    dfd = $.Deferred();

    $.getJSON( last_fm_url, function(a) {
      //console.log( "success" );
    })
    .done(function( results ) {
      dfd.resolve( results );
    })
    .fail(function( error ) {
      //console.log( "error" );
    });

    return dfd.promise();
  };

  fetchTracks = function(){
    var user_list_count, i, promises = [];

    user_list_count = configMap.last_fm.user_list.length;

    for( i = 0; i < user_list_count; i++ ) {
      promises.push( getTracks( configMap.last_fm.user_list[i]) );
    }

    return $.when.apply( $, promises );
  };

  // Begin public methods
  initModule = function(){
    setJqueryMap();

    var get_all_tracks = fetchTracks();

    get_all_tracks.done(function(){
      var all_tracks_arr = [];

      $.each( arguments, function( i, result ) {
        if( result.toptracks.track ){
          all_tracks_arr.push( result.toptracks );
        } else {
          console.warn( ' -- ' + result.toptracks.user + ' does not have any tracks!' );
        }
        //all_tracks_arr.push.apply( all_tracks_arr, result.toptracks.track );
      });

      console.log( all_tracks_arr );
      
      //
      var hash = (function() {
        var keys = {};
        return {
            contains: function(key) {
                return keys[key] === true;
            },
            add: function(key) {
                if (keys[key] !== true)
                {
                    keys[key] = true;
                }
            }
        };
      })();

      var key = null;
      var noDupes = [];
      var dupes = [];
      for (var i = 0; i < all_tracks_arr.length; i++)
      {
          // loop through each track:
          for (var j = 0; j < all_tracks_arr[i].track.length; j++)
          {
              key = all_tracks_arr[i].track[j].mbid;
              if (!hash.contains(key))
              {
                  hash.add(key);
                  noDupes.push(all_tracks_arr[i].track[j]); // if not duplicate
              }
              else
              {
                  dupes.push(all_tracks_arr[i].track[j]); // if duplicate
              }
          }
      }
      console.log(noDupes);
      console.log(dupes);
      //

      outputToDom( all_tracks_arr );
      jqueryMap.$loading.hide();

    }).fail(function( error ){
      //console.log( error );
    });


  };

  // Export public methods explicitly by returning them in a map
  return {
    initModule: initModule
  };
}());

// DOM Ready
$(function() {
  kettle.lastfm.initModule();
});