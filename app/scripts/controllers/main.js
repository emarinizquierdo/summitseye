'use strict';

angular.module('summitseyeApp')
.controller('MainCtrl', function ($scope, $http, Utils) {

	var	  scene
		, camera
		, renderer
		, grass
		, controls
		, container
		, texture
		, material
		, geometry
		, element
		, video
		, videoImage
		, videoImageContext
		, videoTexture
		, projection
		, terrainSize = 10000 // 60 x 60 km
        , heightFactor = terrainSize ;

	$scope.x = 0;
	$scope.y = 90;
	$scope.z = 0;
	$scope.tiltLR;
    $scope.tiltFB;
    $scope.dir;

	_init();
   
    function _init() {
    	_configuration();
		_videoControl();		
	}

	function degInRad(deg) {
	    return deg * Math.PI / 180;
	}

	function _animate(){
		controls.update();
		renderer.render(scene, camera);
	    requestAnimationFrame( _animate );		
	}

    function _configuration(){

    	video = document.getElementById("video");			
    	video.setAttribute('width', window.innerWidth);
    	video.setAttribute('height', window.innerHeight);

    	scene = new THREE.Scene();
	    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

	    renderer = new THREE.WebGLRenderer({ alpha: true });
	    renderer.rendererSize = {width: window.innerWidth, height: window.innerHeight, quality: 100, maxQuality: 400, minQuality: 20};
	    renderer.setSize( renderer.rendererSize.width, renderer.rendererSize.height );
	    container = document.getElementById( 'ThreeJS' );
		container.appendChild( renderer.domElement );

		// Add DeviceOrientation Controls
		controls = new DeviceOrientationController( camera, renderer.domElement );
		controls.connect();

	    material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	    material.side = THREE.DoubleSide;
	    geometry = new THREE.PlaneGeometry(60000,60000);
	    grass = new THREE.Mesh( geometry, material );
	    grass.name = "grass";
	    //scene.add( grass );
	    
	    camera.position.z = 1;
	    camera.position.y = 0;
		Utils.getLocation( function( p_coordinates ){
			_config2( p_coordinates );
		});
	    
    }

    function _videoControl(){
    	MediaStreamTrack.getSources(function(sourceInfos) {

			//Utils.videoDetection(sourceInfos);
			_animate();

		});
    }

 	// Change coordinate space
    function translate(point) {
        return [point[0] - (terrainSize / 2), (terrainSize / 2) - point[1]];
    }

	function _config2( p_coordinates ){
		
		var width  = window.innerWidth,
        height = window.innerHeight;
        //camera.position.set(0, -terrainSize / 2, terrainSize / 2);

    projection = d3.geo.orthographic()
        .translate([terrainSize/2,terrainSize/2])
        .scale(terrainSize * 106.4)  
        .center(p_coordinates);        

console.log(p_coordinates);
        var geometry = new THREE.PlaneGeometry();
        	
        d3.xml('aux/waypoints.gpx', 'application/xml', gpxParser);

       
}
  

    function gpxParser(gpx) {

    	/*
        var points = gpx.getElementsByTagName('wpt'),
            geometry = new THREE.Geometry();
            var x =0;
        for (x = 0; x < points.length; x++) { // points.length
            var point = points[x],
                alt = 10,// parseInt(point.getElementsByTagName('ele')[0].firstChild.nodeValue),
                lat = parseFloat(point.getAttribute('lat')),
                lng = parseFloat(point.getAttribute('lon')),
                coord = projection([lng, lat]);

            geometry.vertices.push(new THREE.Vector3(coord[0], coord[1], (alt / 2470 * heightFactor) + (0.01 * heightFactor))); 
        }
*/
       // console.log(geometry.vertices);
        
        var gMaterial = new THREE.ParticleBasicMaterial({
      			color: 0xFF0000,
      			size: 1
    		});
        

		var axes = Utils.buildAxes( 10000 );
		scene.add(axes);

var geometry = new THREE.Geometry();
var geometry2 = new THREE.Geometry();
var geometry3 = new THREE.Geometry();

var  alt2 = 10,// parseInt(point.getElementsByTagName('ele')[0].firstChild.nodeValue),
  coord2 = translate(projection([-3.68541, 40.46690]));
geometry.vertices.push(new THREE.Vector3(coord2[0], coord2[1], 1)); 
// create the particle system
var geometrySystem = new THREE.ParticleSystem(geometry, gMaterial);

coord2 = translate(projection([-3.68612, 40.46677]));
geometry2.vertices.push(new THREE.Vector3(coord2[0], coord2[1], 1)); 
var gMaterial2 = new THREE.ParticleBasicMaterial({
      			color: 0x000FF,
      			size: 1
    		});
        // create the particle system
		var geometrySystem2 = new THREE.ParticleSystem(geometry2, gMaterial2);


coord2 = translate(projection([-3.68672, 40.46849]));
geometry3.vertices.push(new THREE.Vector3(coord2[0], coord2[1], 1)); 
var gMaterial3 = new THREE.ParticleBasicMaterial({
      			color: 0x00FF00,
      			size: 1
    		});
        // create the particle system
		var geometrySystem3 = new THREE.ParticleSystem(geometry3, gMaterial3);
		// add it to the scene
		scene.add(geometrySystem2);
		scene.add(geometrySystem);
		scene.add(geometrySystem3);
		 
    }

  });
