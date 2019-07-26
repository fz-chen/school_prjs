var scene = new THREE.Scene();
scene.background = new THREE.Color( 0x0088cc );
var camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000);
var tailWagOn = false;
var tailWag = 1;
var tailRotationSum = 0;
var tailButton = document.getElementById('tailWag');
tailButton.onclick = function(){
	if(tailWagOn){
		tailWagOn = false;
	} else {
		tailWagOn = true;
	}
}

var container = document.getElementById('canvas');
var renderer = new THREE.WebGLRenderer();
var w = container.offsetWidth;
var h = container.offsetHeight;
renderer.setSize(w, h);
container.appendChild(renderer.domElement);

camera.position.z = 30;



var geometry;
var material;
geometry = new THREE.CylinderGeometry(0.9,1.5,1,4);
material = new THREE.MeshPhongMaterial({color: 0x333333});

// var material = [
// new THREE.MeshPhongMaterial({color: 0xff0000}),
// new THREE.MeshPhongMaterial({color: 0x00ff00}),
// new THREE.MeshPhongMaterial({color: 0xffff00}),

// ]

var nose = new THREE.Mesh(geometry, material);
nose.rotation.x = 0.6;
nose.rotation.y = 0.78;
// nose.translateZ(2);


//snout 
var length = 2, width = 1.5;

var shape = new THREE.Shape();
shape.moveTo( 0,0 );
shape.lineTo( 0, width );
shape.lineTo( length, width );
shape.lineTo( length, 0 );
shape.lineTo( 0, 0 );

var extrudeSettings = {
	steps: 2,
	depth: 5,
	bevelEnabled: true,
	bevelThickness: 1.5,
	bevelSize: 1,
	bevelSegments: 1
};

geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );
material = new THREE.MeshPhongMaterial( { color: 0xcccccc } );
var snout = new THREE.Mesh( geometry, material ) ;

snout.translateZ(-5.7);
snout.translateY(-1.9);
snout.translateX(-1);

var sGroup1 = new THREE.Group();
sGroup1.add(nose);
sGroup1.add(snout);

//face connect
var length = 4, width = 3;

var shape = new THREE.Shape();
shape.moveTo( 0,0 );
shape.lineTo( 0, width );
shape.lineTo( length, width );
shape.lineTo( length, 0 );
shape.lineTo( 0, 0 );

var extrudeSettings = {
	steps: 2,
	depth: 0,
	bevelEnabled: true,
	bevelThickness: 1.5,
	bevelSize: 2,
	bevelSegments: 1
};

geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );
material = new THREE.MeshPhongMaterial( { color: 0xcccccc } );
var faceConnect = new THREE.Mesh( geometry, material ) ;
faceConnect.translateZ(-7);
faceConnect.translateY(-2.5);
faceConnect.translateX(-2);
sGroup1.add(faceConnect);

//face cube
var length = 7, width = 4;

var shape = new THREE.Shape();
shape.moveTo( 0,0 );
shape.lineTo( 0, width );
shape.lineTo( length, width );
shape.lineTo( length, 0 );
shape.lineTo( 0, 0 );

var extrudeSettings = {
	steps: 2,
	depth: 11,
	bevelEnabled: true,
	bevelThickness: 1,
	bevelSize: 1,
	bevelSegments: 1
};

geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );
material = new THREE.MeshPhongMaterial( { color: 0xcccccc } );
var face = new THREE.Mesh( geometry, material ) ;
face.translateZ(-11.8);
face.translateY(6);
face.translateX(-3.5);
face.rotation.x = 1.6;

sGroup1.add(face);

var sGroup2 = new THREE.Group();
//eye Right
var path = new THREE.Shape();
path.absellipse(0,0,0.5,1,0, Math.PI*2, false,0);
var geometry = new THREE.ShapeBufferGeometry( path );
var material = new THREE.MeshBasicMaterial( { color: 0xffffff} );
var eyeR = new THREE.Mesh( geometry, material );

eyeR.translateY(2);
eyeR.translateX(1.2);
sGroup2.add(eyeR);

// pupil right
geometry = new THREE.CircleGeometry( 0.25, 32 );
material = new THREE.MeshBasicMaterial( { color: 0x0088cc } );
var pupilR = new THREE.Mesh( geometry, material );
pupilR.translateY(1.8);
pupilR.translateX(1.2);
pupilR.translateZ(0.01);
sGroup2.add(pupilR);

//eye Left
var path = new THREE.Shape();
path.absellipse(0,0,0.5,1,0, Math.PI*2, false,0);
var geometry = new THREE.ShapeBufferGeometry( path );
var material = new THREE.MeshBasicMaterial( { color: 0xffffff} );
var eyeL = new THREE.Mesh( geometry, material );
eyeL.translateY(2);
eyeL.translateX(-1.2);
sGroup2.add(eyeL);

// pupil left
geometry = new THREE.CircleGeometry( 0.25, 32 );
material = new THREE.MeshBasicMaterial( { color: 0x0088cc } );
var pupilL = new THREE.Mesh( geometry, material );
pupilL.translateY(1.8);
pupilL.translateX(-1.2);
pupilL.translateZ(0.01);
sGroup2.add(pupilL);
sGroup2.translateZ(-6.8);
sGroup2.translateY(1);


//ears 
var sGroup3 = new THREE.Group();
var geometry = new THREE.CylinderGeometry(0.9,1.5,2,44);
var material = new THREE.MeshPhongMaterial( {color: 0xcccccc} );
var earR = new THREE.Mesh( geometry, material );
earR.translateX(1.8);
sGroup3.add(earR);

var geometry = new THREE.CylinderGeometry(0.9,1.5,2,44);
var material = new THREE.MeshPhongMaterial( {color: 0xcccccc} );
var earL = new THREE.Mesh( geometry, material );
earL.translateX(-1.8);
sGroup3.add(earL);
sGroup3.translateY(7.5);
sGroup3.translateZ(-9.5);

var groupHead = new THREE.Group();
groupHead.add(sGroup1);
groupHead.add(sGroup2);
groupHead.add(sGroup3);

groupHead.translateY(5);

//neck
var groupBody = new THREE.Group();
geometry = new THREE.BoxGeometry( 5, 5, 4 );
material = new THREE.MeshPhongMaterial( {color: 0xcccccc} );
var neck = new THREE.Mesh( geometry, material );
neck.translateY(-3.5);
neck.translateZ(-10);
groupBody.add(neck);

//body
geometry = new THREE.BoxGeometry( 10, 16, 8 );
material = new THREE.MeshPhongMaterial( {color: 0xcccccc} );
var bodyTrunk = new THREE.Mesh( geometry, material );
bodyTrunk.translateZ(-15);
bodyTrunk.translateY(-10);
bodyTrunk.rotation.x = 0.6;
groupBody.add(bodyTrunk);


//front leg
var sGroup4 = new THREE.Group();
geometry = new THREE.BoxGeometry( 2, 14, 2 );
material = new THREE.MeshPhongMaterial( {color: 0xcccccc} );
var legFR = new THREE.Mesh( geometry, material );
legFR.translateX(2);
sGroup4.add(legFR);
geometry = new THREE.BoxGeometry( 2, 14, 2 );
var legFL = new THREE.Mesh( geometry, material );
legFL.translateX(-2);
sGroup4.add(legFL);

sGroup4.translateY(-12);
sGroup4.translateZ(-9);

//back leg
var sGroup5 = new THREE.Group();
geometry = new THREE.BoxGeometry( 2, 2, 10 );
material = new THREE.MeshPhongMaterial( {color: 0xcccccc} );
var legBR = new THREE.Mesh( geometry, material );
legBR.translateX(4);
sGroup5.add(legBR);
geometry = new THREE.BoxGeometry( 2, 2, 10 );
var legBL = new THREE.Mesh( geometry, material );
legBL.translateX(-4);
sGroup5.add(legBL);
sGroup5.translateY(-18);
sGroup5.translateZ(-12);

groupBody.add(sGroup4);
groupBody.add(sGroup5);

//tail 
var sGroup6 = new THREE.Group();
geometry = new THREE.ConeGeometry( 1, 3, 32 );
var tailT = new THREE.Mesh( geometry, material );
sGroup6.add(tailT);

geometry = new THREE.CylinderGeometry( 1, 1, 8, 32 );
var tailM = new THREE.Mesh( geometry, material );
tailM.translateY(-4);
sGroup6.add(tailM);

geometry = new THREE.ConeGeometry( 1, 3, 32 );
var tailB = new THREE.Mesh( geometry, material );
tailB.rotation.z = 3.14;
tailB.translateY(9);
sGroup6.add(tailB);
sGroup6.translateZ(-22);
sGroup6.translateY(-15);
sGroup6.rotation.x = -1.3;



groupBody.add(sGroup6);



var group = new THREE.Group();
group.add(groupHead);
group.add(groupBody);

scene.add(group);



var directionalLight = new THREE.DirectionalLight( 0xbbbbbb, 1 );
directionalLight.position.set( 0, 2, 5 );
scene.add( directionalLight );

var update = function(){
	// cube.rotation.x += 0.01;
	// var rotationAngle = document.getElementById('rotationAngle').value;
	// sGroup6.rotation.z = rotationAngle*0.01 + 3.14;

	if(tailWagOn){
		if(tailRotationSum > 0){
			tailWag *= -1;
		}
		if(tailRotationSum < -2.6){
			tailWag *= -1;
		}
		tailRotationSum = tailRotationSum + tailWag * 0.08;
		
	} 
	sGroup6.rotation.z = 1.3+ tailRotationSum + 3.14;

	var rotationAngle = document.getElementById('headRotation').value;
	groupHead.rotation.z = rotationAngle*0.01 ;

	var rotateAngleY = document.getElementById('rotateAngleY').value;
	group.rotation.y = rotateAngleY*0.01;

};

// draw scene
var render = function(){
	renderer.render(scene, camera);
};

//game loop
var GameLoop = function(){
	requestAnimationFrame(GameLoop);

	update();
	render();
}

GameLoop();


