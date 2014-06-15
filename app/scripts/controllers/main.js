'use strict';

angular.module('summitseyeApp')
.controller('MainCtrl', function ($scope, $http) {

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
		, terrainSize = 60 // 60 x 60 km
        , heightFactor = terrainSize / 12;

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
	    geometry = new THREE.PlaneGeometry(24, 24);
	    grass = new THREE.Mesh( geometry, material );
	    grass.name = "grass";
	    scene.add( grass );
	    
	    camera.position.z = 5;
	    camera.position.y = 0;

	    _config2();
    }
    
    function _videoDetection(sourceInfos){

		var	  videoSource = []
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

		if(navigator.getUserMedia) { // Standard
			navigator.getUserMedia(constraints, function(stream) {
				video.src = stream;
				video.play();
			});
		} else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
			navigator.webkitGetUserMedia(constraints, function(stream){
				video.src = window.webkitURL.createObjectURL(stream);
				video.play();
			});
		} else if(navigator.mozGetUserMedia) { // WebKit-prefixed
			navigator.mozGetUserMedia(constraints, function(stream){
				video.src = window.URL.createObjectURL(stream);
				video.play();
			});
		}
    }

    function _videoControl(){
    	MediaStreamTrack.getSources(function(sourceInfos) {

			//_videoDetection(sourceInfos);
			_animate();

		});
    }

 	// Change coordinate space
    function translate(point) {
        return [point[0] - (terrainSize / 2), (terrainSize / 2) - point[1]];
    }

	function _config2(){
		
		var width  = window.innerWidth,
        height = window.innerHeight;
        
/*
    var scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xeeeeee));

    var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, -terrainSize / 2, terrainSize / 2);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);

    var terrainLoader = new THREE.TerrainLoader();
    terrainLoader.load('../assets/jotunheimen512.bin', createTerrain);
*/
    projection = d3.geo.transverseMercator()
        .translate([terrainSize / 2, terrainSize / 2])
        .scale(terrainSize * 1)  
        .rotate([-9, 0, 0])
        .center([-0.714, 61.512]);        

        var geometry = new THREE.PlaneGeometry();
        	
        d3.xml('aux/waypoints.gpx', 'application/xml', gpxParser);

       
}
  
  	function buildAxes( length ) {
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

    function gpxParser(gpx) {
        var points = gpx.getElementsByTagName('wpt'),
            geometry = new THREE.Geometry();
            var x =0;
        for (x = 0; x < points.length; x++) { // points.length
            var point = points[x],
                alt = 0,// parseInt(point.getElementsByTagName('ele')[0].firstChild.nodeValue),
                lat = parseFloat(point.getAttribute('lat')),
                lng = parseFloat(point.getAttribute('lon')),
                coord = translate(projection([lng, lat]));

            geometry.vertices.push(new THREE.Vector3(coord[0], coord[1], (alt / 2470 * heightFactor) + (0.01 * heightFactor))); 
        }

        console.log(geometry.vertices);
        
        var gMaterial = new THREE.ParticleBasicMaterial({
      			color: 0xFF0000,
      			size: 2
    		});
        // create the particle system
		var geometrySystem = new THREE.ParticleSystem(geometry, gMaterial);

		// add it to the scene
		scene.add(geometrySystem);
		 var axes = buildAxes( 1000 );
		scene.add(axes);
    }

  });