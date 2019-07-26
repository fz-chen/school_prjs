var baseID = 0;
var armID = 1;
var handID = 2;

var rotation = {
  base: 0,
  arm: 0,
  hand: 0,
}

var ballState = {
  ballX: 999,
  ballY: 999,
  thetaOne: 0,
  thetaTwo: 0,
}

document.addEventListener("keydown", function(event) {
  if(event.keyCode ==82){
    rotation = {
      base: 0,
      arm: 0,
      hand: 0,
    }

    document.getElementById('baseAngle').value = 0;
    document.getElementById('armAngle').value = 0;
    document.getElementById('handAngle').value = 0;
    initNodes(0);initNodes(1);initNodes(2);
  }

});

var canvas = document.getElementById( "gl-canvas" );

canvas.addEventListener("click", function(event){

    ballState.ballX = (event.clientX - 250 -9)/30;
    ballState.ballY = (250 - event.clientY +9)/30;


    var x2py2 = Math.pow(ballState.ballX,2) + Math.pow(ballState.ballY,2);
    var thetaRBottomDummy = Math.sqrt(x2py2);
    var thetaR = Math.acos(ballState.ballX / thetaRBottomDummy);

    var thetaOneTopDummy = Math.pow(3,2) + x2py2 - Math.pow(1.5,2);
    var thetaOneBottomDummy = 2*3*Math.sqrt(x2py2); 
    ballState.thetaOne = thetaR - Math.acos(thetaOneTopDummy/thetaOneBottomDummy);

    var thetaTwoTopDummy = Math.pow(3,2) + Math.pow(1.5,2) - x2py2;
    var thetaTwoBottomDummy = 2*3*1.5;
    ballState.thetaTwo = Math.PI - Math.acos(thetaTwoTopDummy/thetaTwoBottomDummy);

    if(ballState.ballY<0){
      ballState.thetaOne *= -1;
      ballState.thetaTwo *= -1;
    }
    var baseRotateAngle = document.getElementById('baseAngle').value;
    if(baseRotateAngle == 0){
      document.getElementById('armAngle').value = r2d(ballState.thetaOne);
      document.getElementById('handAngle').value = r2d(ballState.thetaTwo);
    }

} );

var gl = WebGLUtils.setupWebGL( canvas );
if ( !gl ) { alert( "WebGL isn't available" ); }

var shaderProgram = initShaders( gl, "vertex-shader", "fragment-shader" );  
var programInfo = {
  program: shaderProgram,
  attribLocations: {
    vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),

  },
  uniformLocations: {
    projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
    modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    colorLocation: gl.getUniformLocation(shaderProgram, 'uColor'),
  },
};

var baseBuffer = initBaseBuffer(gl);
var armBuffer = initArmBuffer(gl);
var handBuffer = initHandBuffer(gl);



var scalingFactor = 3;
gl.enable(gl.DEPTH_TEST); 
//gl.enable(gl.CULL_FACE);

gl.clearColor(0.2, 0.2, 0.2, 1.0);  // Clear to black, fully opaque
gl.clearDepth(1.0);                 // Clear everything

gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

gl.useProgram(programInfo.program);

var figure = [];
var mvStack = [ ];
var modelViewMatrix = mat4();
var camera = vec3(0,0,8);
modelViewMatrix= lookAt( camera, vec3(0,0,0), vec3(0,1,0));
var projectionMatrix;
const fieldOfView = 90;   // in radians
const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
const zNear = 0.1;
const zFar = 100.0;
projectionMatrix = perspective(fieldOfView, aspect, zNear, zFar);
gl.uniformMatrix4fv(
  programInfo.uniformLocations.projectionMatrix,
  false,
  flatten(projectionMatrix));

initNodes(0);
initNodes(1);
initNodes(2);
console.log(figure);

function initRender(){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var baseRotateAngle = document.getElementById('baseAngle').value;
  if(rotation.base != baseRotateAngle){
    if(baseRotateAngle<rotation.base){
      rotation.base -= 2;
    }
    if(baseRotateAngle>rotation.base){
      rotation.base += 2;
    }
    initNodes(0);
  }
  var armRotateAngle = document.getElementById('armAngle').value;
  if(rotation.arm != armRotateAngle){
    if(armRotateAngle<rotation.arm){
      rotation.arm -= 2;
    }
    if(armRotateAngle>rotation.arm){
      rotation.arm += 2;
    }
    initNodes(1);
  }
  var handRotateAngle = document.getElementById('handAngle').value;
  if(rotation.hand != handRotateAngle){
    if(handRotateAngle<rotation.hand){
      rotation.hand -= 2;
    }
    if(handRotateAngle>rotation.hand){
      rotation.hand += 2;
    }
    initNodes(2);
  }

  document.getElementById('baseAngleOutput').innerHTML = document.getElementById('baseAngle').value;
  document.getElementById('armAngleOutput').innerHTML = document.getElementById('armAngle').value;
  document.getElementById('handAngleOutput').innerHTML = document.getElementById('handAngle').value;
  traverse(0);
  if(ballState.thetaOne && ballState.thetaTwo){
    drawBall();
  }
  requestAnimFrame(initRender);
}

initRender();




function traverse(id){
  if(id==null){return;}

  mvStack.push(modelViewMatrix);
  modelViewMatrix = mult(modelViewMatrix, figure[id].transform);
  figure[id].render();

  if (figure[id].child != null) {
    traverse(figure[id].child);
  }
  modelViewMatrix = mvStack.pop();
  if (figure[id].sibling != null) {
    traverse(figure[id].sibling);
  }
}

function drawBall(){
  var camera = vec3(0,0,8);
  drawBallMatrix= lookAt( camera, vec3(0,0,0), vec3(0,1,0));
  var translateDummy = translate(ballState.ballX,ballState.ballY,0);
  drawBallMatrix = mult(drawBallMatrix,translateDummy);
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    flatten(drawBallMatrix));

  var ballPosition = [
  0,0,0.31,
  0.1, 0,0.31,
  0.08, 0.08, 0.31,
  0,    0.1,0.31,
  -0.08, 0.08, 0.31,
  -0.1, 0,0.31,
  -0.08, -0.08, 0.31,
  0,     -0.1, 0.31,
  0.08, -0.08, 0.31,
  0.1, 0,0.31,
  ];
  var ballBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ballBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ballPosition), gl.STATIC_DRAW);
  gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0,0);

  gl.uniform4fv( 
      programInfo.uniformLocations.colorLocation, [1, 1, 1, 1]); 
  var baseRotateAngle = document.getElementById('baseAngle').value;
  if(baseRotateAngle == 0){
    gl.drawArrays(gl.TRIANGLE_FAN,0,10);
  }
}

function initNodes(id){
  var m = mat4();
  switch (id){
    case 0:
      m = rotate(rotation.base, [0,1,0]);
      figure[0] = createNode(m, drawBase, null, 1);
      break;
    case 1:
      m = rotate(-90, [0,0,1]);
      var rotateArm = rotate(rotation.arm, [0,0,1]);
      m = mult(m, rotateArm);
      figure[1] = createNode(m, drawArm, null, 2);
      break;
    case 2:
      m = translate(0,scalingFactor,0);  
      m = mult(m, rotate(rotation.hand, [0,0,1]) );
      figure[2] = createNode(m, drawHand, null, null);
      break;
  }
}


function drawBase(){

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      flatten(modelViewMatrix));
    {
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, baseBuffer.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);

  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, baseBuffer.elements);
  gl.uniform4fv( 
      programInfo.uniformLocations.colorLocation, [0.2, 0.2, 0.8, 1]); 
  
  {
    const vertexCount = 36; //the number of indices
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
}

function drawArm(){
  var scaleMatrix = scalem(1,scalingFactor,1);
  var instanceMatrix = mult(modelViewMatrix, scaleMatrix);
  {
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, armBuffer.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, armBuffer.elements);

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      flatten(instanceMatrix));

  gl.uniform4fv( 
      programInfo.uniformLocations.colorLocation, [0.2, 0.8, 0.2, 1]); 
  
  {
    const vertexCount = 36; //the number of indices
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
}

function drawHand(){
  var scaleMatrix = scalem(1,scalingFactor,1);
  instanceMatrix = mult(modelViewMatrix, scaleMatrix);

  {
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, handBuffer.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, handBuffer.elements);

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      flatten(instanceMatrix));

  gl.uniform4fv( 
      programInfo.uniformLocations.colorLocation, [0.8, 0.2, 0.2, 1]); 
  
  {
    const vertexCount = 36; //the number of indices
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
}

function initBaseBuffer(gl){
  const positions = [
  -1.0, -1.0,  1,
   1.0, -1.0,  1,
   1.0,  0,  1,
  -1.0,  0,  1,
  
  // Back face
  -1.0, -1.0, -1.0,
  -1.0,  0, -1.0,
   1.0,  0, -1.0,
   1.0, -1.0, -1.0,
  
  // Top face
  -1.0,  0, -1.0,
  -1.0,  0,  1.0,
   1.0,  0,  1.0,
   1.0,  0, -1.0,
  
  // Bottom face
  -1.0, -1.0, -1.0,
   1.0, -1.0, -1.0,
   1.0, -1.0,  1.0,
  -1.0, -1.0,  1.0,
  
  // Right face
   1.0, -1.0, -1.0,
   1.0,  0, -1.0,
   1.0,  0,  1.0,
   1.0, -1.0,  1.0,
  
  // Left face
  -1.0, -1.0, -1.0,
  -1.0, -1.0,  1.0,
  -1.0,  0,  1.0,
  -1.0,  0, -1.0,
  ];
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


  const elements = [
   0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
    ];
  const elementsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(elements), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    elements: elementsBuffer,
  };
}


function initArmBuffer(gl){
  const positions = [
    // Front face
    -0.3, 0,  0.3,
     0.3, 0,  0.3,
     0.3,  1.0,  0.3,
    -0.3,  1.0,  0.3,

    // Back face
    -0.3, 0, -0.3,
    -0.3,  1.0, -0.3,
     0.3,  1.0, -0.3,
     0.3, 0, -0.3,

    // Top face
    -0.3,  1.0, -0.3,
    -0.3,  1.0,  0.3,
     0.3,  1.0,  0.3,
     0.3,  1.0, -0.3,

    // Bottom face
    -0.3, 0, -0.3,
     0.3, 0, -0.3,
     0.3, 0,  0.3,
    -0.3, 0,  0.3,

    // Right face
     0.3, 0, -0.3,
     0.3,  1.0, -0.3,
     0.3,  1.0,  0.3,
     0.3, 0,  0.3,

    // Left face
    -0.3, 0, -0.3,
    -0.3, 0,  0.3,
    -0.3,  1.0,  0.3,
    -0.3,  1.0, -0.3,
  ];
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


  const elements = [
   0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
    ];
  const elementsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(elements), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    elements: elementsBuffer,
  };
}

function initHandBuffer(gl){
  const positions = [
    // Front face
    -0.3, 0,  0.3,
     0.3, 0,  0.3,
     0.3,  0.5,  0.3,
    -0.3,  0.5,  0.3,

    // Back face
    -0.3, 0, -0.3,
    -0.3,  0.5, -0.3,
     0.3,  0.5, -0.3,
     0.3, 0, -0.3,

    // Top face
    -0.3,  0.5, -0.3,
    -0.3,  0.5,  0.3,
     0.3,  0.5,  0.3,
     0.3,  0.5, -0.3,

    // Bottom face
    -0.3, 0, -0.3,
     0.3, 0, -0.3,
     0.3, 0,  0.3,
    -0.3, 0,  0.3,

    // Right face
     0.3, 0, -0.3,
     0.3,  0.5, -0.3,
     0.3,  0.5,  0.3,
     0.3, 0,  0.3,

    // Left face
    -0.3, 0, -0.3,
    -0.3, 0,  0.3,
    -0.3,  0.5,  0.3,
    -0.3,  0.5, -0.3,
  ];
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


  const elements = [
   0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
    ];
  const elementsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(elements), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    elements: elementsBuffer,
  };
}

function createNode(transform, render, sibling, child)
{
  var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child
};
  return node;
}

function r2d(radians)
{
  var pi = Math.PI;
  return radians * (180/pi);
}

function d2r(degree){
  var pi = Math.PI;
  return (degree/180) * pi ;
}

