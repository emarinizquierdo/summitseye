'use strict';

angular.module('summitseyeApp')
.service('Utils', function(){

  var _utils = {};

  _utils.getLocation = function( p_callback ) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function( position ){
          p_callback( [position.coords.longitude, position.coords.latitude] );
        });
    }
  }

  _utils.buildAxes = function( length ) {
    var axes = new THREE.Object3D();

    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

    return axes;
  }

  function buildAxis( src, dst, colorHex, dashed ) {
    var geom = new THREE.Geometry(),
        mat; 

    if(dashed) {
            mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
    } else {
            mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
    }

    geom.vertices.push( src.clone() );
    geom.vertices.push( dst.clone() );
    geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

    var axis = new THREE.Line( geom, mat, THREE.LinePieces );

    return axis;
  }

  _utils.videoDetection = function( p_video, sourceInfos){

    var   videoSource = []
      , _j = 0;

    for (var i = 0; i != sourceInfos.length; ++i) {
      
        var sourceInfo = sourceInfos[i];
        if (sourceInfo.kind === 'video') {
          videoSource[_j] = sourceInfo.id;
          _j++;
        }     
    }

    var constraints = {
        video: {
          optional: [{sourceId: videoSource[1]}]
        }
    };

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    navigator.getUserMedia(constraints, function(stream){
      p_video.src = window.URL.createObjectURL(stream);
      p_video.play(); 
    }, function(){});
    
  }

  return _utils;

});