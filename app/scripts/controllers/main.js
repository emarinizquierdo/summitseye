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
		, terrainSize = 1000 // 60 x 60 km
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
	    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 10000 );

	    renderer = new THREE.WebGLRenderer({ alpha: true });
	    renderer.rendererSize = {width: window.innerWidth, height: window.innerHeight, quality: 100, maxQuality: 400, minQuality: 20};
	    renderer.setSize( renderer.rendererSize.width, renderer.rendererSize.height );
	    container = document.getElementById( 'ThreeJS' );
		container.appendChild( renderer.domElement );

		// Add DeviceOrientation Controls
		controls = new DeviceOrientationController( camera, renderer.domElement );
		controls.connect();
	    
	    camera.position.z = 1;
	    camera.position.y = 0;
		Utils.getLocation( function( p_coordinates ){
			_config2( p_coordinates );
			_videoControl( video );
		});


	    
    }

    function _videoControl( p_video ){

    	MediaStreamTrack.getSources(function(sourceInfos) {

			Utils.videoDetection( p_video, sourceInfos);
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

        var geometry = new THREE.PlaneGeometry();
        	
        d3.xml('aux/VG_Madrid.gpx', 'application/xml', gpxParser);

       
}
  

    function gpxParser(gpx) {

        var points = gpx.getElementsByTagName('wpt'),
            geometry = new THREE.Geometry();
            var x =0;
            
        for (x = 0; x < points.length; x++) { // points.length
            var point = points[x],
                alt = 10,// parseInt(point.getElementsByTagName('ele')[0].firstChild.nodeValue),
                lat = parseFloat(point.getAttribute('lat')),
                lng = parseFloat(point.getAttribute('lon')),
                name = point.getElementsByTagName('cmt')[0].firstChild.nodeValue,
                coord = translate(projection([lng, lat]));

            geometry.vertices.push(new THREE.Vector3(coord[0], coord[1], 1)); 

			// Creamos geometria texto pasandole parametros
			var  text3d = new THREE.TextGeometry( name, {
			    size: 0.1,
			    height: 0,
			    curveSegments: 2,
			    font: "helvetiker"
			});
			                
			// Creamos material con color aleatorio
			var textMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});

			// Creamos el mesh uniendo geometria y material
			var text = new THREE.Mesh( text3d, textMaterial );

			// Posicionamos texto
			text.position.x = coord[0];
			text.position.y = coord[1];
			text.position.z = 1;

			text.rotation.x = degInRad(90);
			text.rotation.y = degInRad(180);

			// Renderizamos
			scene.add(text);

        }
        
        var gMaterial = new THREE.ParticleBasicMaterial({
      			color: 0xFF0000,
      			size: 1
    		});

		var geometrySystem = new THREE.ParticleSystem(geometry, gMaterial);
		scene.add(geometrySystem);
		
    }

  });
