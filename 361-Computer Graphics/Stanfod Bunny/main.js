var canvas;
var gl;        
 
var program;
var pointLightRun = true;
var mouseState = {
  lastX: -1,
  lastY: -1,
  dragged: false,
}
var translation = {
  x: 0,
  y: 0,
  z: 0,
}
var rotation = {
  x: 0,
  y: 0,
}
var pointLightCord = {
  x: 5,
  z: 0,
}

document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener("keydown", function(event) {
  if(event.keyCode == 82){
    translation = {
      x: 0,
      y: 0,
      z: 0,
    }
    rotation = {
      x: 0,
      y: 0,
    }
  }  
  if(event.keyCode == 38){
    translation.z += 1;
  }
  if(event.keyCode == 40){
    translation.z -= 1;
  }
  if(event.keyCode ==80){
    if(pointLightRun){
      pointLightRun=false;
    }else{
      pointLightRun=true
    }
  }
});
main();

function main(){

  canvas = document.getElementById( "gl-canvas" );

  canvas.onmousedown = mousedown;
  canvas.onmouseup = mouseup;
  canvas.onmousemove = mousemove;
    
  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }

  shaderProgram = initShaders( gl, "vertex-shader", "fragment-shader" );    
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      normalLocation: gl.getAttribLocation(shaderProgram, 'a_normal'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      colorLocation: gl.getUniformLocation(shaderProgram, 'uColor'),
      lightWorldPositionLocation: gl.getUniformLocation(shaderProgram, "u_lightWorldPosition"),
      worldLocation: gl.getUniformLocation(shaderProgram, "u_world"),
      worldInverseTransposeLocation: gl.getUniformLocation(shaderProgram, "u_worldInverseTranspose"),
      viewWorldPositionLocation: gl.getUniformLocation(shaderProgram, "u_viewWorldPosition"),
      shininessLocation: gl.getUniformLocation(shaderProgram, "u_shininess"),
    },
  };
  var positionBuffer = initBuffers(gl);

//drawScene(gl, programInfo, positionBuffer);
  var deltaTime = 0;

  function render() {
    deltaTime += 0.1;

    drawScene(gl, programInfo, positionBuffer, deltaTime);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

}

function initBuffers(gl){
  

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  const positions = flatten(get_vertices());
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


  const normals = flatten(setNormals());
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);


  var bunnyIndicies = flatten(get_faces());
  var bunnyIndicies = bunnyIndicies.map( function(value) { 
    return value - 1; 
  } );
  const elements = bunnyIndicies;
  const elementsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(elements), gl.STATIC_DRAW);

  var pointLight = [
  //front square
    -0.1, -0.1, 0.1,
    -0.1, 0.1,  0.1,
    0.1,  0.1,  0.1,
    0.1,  -0.1, 0.1,
    -0.1, -0.1, 0.1,
    0.1,  -0.1, 0.1,
    -0.1, 0.1,  0.1,
    0.1,  0.1,  0.1,
  //back square
    -0.1, -0.1, -0.1,
    -0.1, 0.1,  -0.1,
    0.1,  0.1,  -0.1,
    0.1,  -0.1, -0.1,
    -0.1, -0.1, -0.1,
    0.1,  -0.1, -0.1,
    -0.1, 0.1,  -0.1,
    0.1,  0.1,  -0.1,
  //side lines
    -0.1, -0.1, 0.1,
    -0.1, -0.1, -0.1,
    -0.1, 0.1,  0.1,
    -0.1, 0.1,  -0.1,
    0.1,  0.1,  0.1,
    0.1,  0.1,  -0.1,
    0.1,  -0.1, 0.1,
    0.1,  -0.1, -0.1,
  ];
  const pointLightBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pointLightBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointLight), gl.STATIC_DRAW);
  return {
    position: positionBuffer,
    elements: elementsBuffer,
    normals: normalBuffer,
    pointLights: pointLightBuffer,
  };
}

function setNormals(){
  var vertex = get_vertices();
  var indices = get_faces();
  var normalVertex = [];
  for (i=0;i<vertex.length;i++){
    normalVertex[i] = [];
  }

  var subIndex; var point0;
  var point1; var point2;
  var vecA; var vecB; var crossAB;

  for(i=0; i<indices.length; i++){
    subIndex = indices[i];
    const point0 = vertex[subIndex[0]-1];
    const point1 = vertex[subIndex[1]-1];
    const point2 = vertex[subIndex[2]-1];
    vecA = subtract(point1,point0);
    vecB = subtract(point2,point0);
    crossAB = normalize(cross(vecA, vecB));
    // if(crossAB[1] < 0){
    //   crossAB = normalize(cross(vecB, vecA));
    // }
    normalVertex[subIndex[0]-1].push(crossAB);
    normalVertex[subIndex[1]-1].push(crossAB);
    normalVertex[subIndex[2]-1].push(crossAB);
  }
  
  var indexNormalAverage = [];
  var counter; var sumVec; 
  var xNorm; var yNorm; var zNorm;

  for(i=0; i<normalVertex.length; i++){
    counter = 0;
    sumVec = [0,0,0];
    for(j=0; j<normalVertex[i].length; j++){
      counter++;
      sumVec = add(sumVec, normalVertex[i][j]);
    }
    xNorm = sumVec[0]/counter;
    yNorm = sumVec[1]/counter;
    zNorm = sumVec[2]/counter;
    indexNormalAverage[i] = vec3(xNorm,yNorm,zNorm);
  }
  return indexNormalAverage;
}





function drawScene(gl, programInfo, buffers, deltaTime){
  if(pointLightRun){
    pointLightCord.x = (pointLightCord.x*Math.cos(-0.8* Math.PI / 180)) - (pointLightCord.z*Math.sin(-0.8* Math.PI / 180));
    pointLightCord.z = (pointLightCord.z*Math.cos(-0.8* Math.PI / 180)) + (pointLightCord.x*Math.sin(-0.8* Math.PI / 180));
  }


  gl.enable(gl.DEPTH_TEST); 
  //gl.enable(gl.CULL_FACE);

  gl.clearColor(0.2, 0.2, 0.2, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const fieldOfView = 75;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  var projectionMatrix;
  var modelViewMatrix;
  var camera = vec3(0,0,10);
  projectionMatrix = perspective(fieldOfView, aspect, zNear, zFar);
  modelViewMatrix= lookAt( camera, vec3(0,0,0), vec3(0,1,0));


  var rotateX = rotate(rotation.x, [1,0,0]);
  var rotateY = rotate(rotation.y, [0,1,0]);

  var translationMatrix = translate(translation.x,-translation.y,translation.z);  

  var worldMatrix = mult(rotateX, rotateY);
  worldMatrix = mult(translationMatrix, worldMatrix);

  modelViewMatrix = mult(modelViewMatrix, worldMatrix);
  var worldInverseMatrix = inverse(worldMatrix);
  var worldInverseTransposeMatrix = transpose(worldInverseMatrix);

  {
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);

  }


  {
  gl.enableVertexAttribArray(programInfo.attribLocations.normalLocation);
 
// Bind the normal buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);

  // Tell the attribute how to get data out of normalBuffer (ARRAY_BUFFER)
  var size = 3;          // 3 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floating point values
  var normalize = false; // normalize the data (convert from 0-255 to 0-1)
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      programInfo.attribLocations.normalLocation, 3, type, normalize, stride, offset)
  }


  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.elements);
  

  gl.useProgram(programInfo.program);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      flatten(projectionMatrix));
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      flatten(modelViewMatrix));

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.worldLocation,
      false,
      flatten(worldMatrix));
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.worldInverseTransposeLocation, 
      false, 
      flatten(worldInverseTransposeMatrix));

  gl.uniform4fv( 
      programInfo.uniformLocations.colorLocation, [0.2, 0.2, 0.8, 1]); 
  gl.uniform1i(
      gl.getUniformLocation(shaderProgram, 'enableLight'), true);
  gl.uniform3fv(
      programInfo.uniformLocations.lightWorldPositionLocation, [pointLightCord.x,5,pointLightCord.z]);
  // set the camera/view position
  gl.uniform3fv(
      programInfo.uniformLocations.viewWorldPositionLocation, camera);
  gl.uniform1f(
      programInfo.uniformLocations.shininessLocation, 150);
  
  {
    const vertexCount = 31320; //the number of indices
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
  
  projectionMatrix = perspective(fieldOfView, aspect, zNear, zFar);
  modelViewMatrix= lookAt( camera, vec3(0,0,0), vec3(0,1,0));
  var worldMatrix = rotate(0, [1,0,0]);

  modelViewMatrix = mult(modelViewMatrix, worldMatrix);
  var worldInverseMatrix = inverse(worldMatrix);
  var worldInverseTransposeMatrix = transpose(worldInverseMatrix);

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      flatten(projectionMatrix));
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      flatten(modelViewMatrix));

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.worldLocation,
      false,
      flatten(worldMatrix));
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.worldInverseTransposeLocation, 
      false, 
      flatten(worldInverseTransposeMatrix));

    {
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.pointLights);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);

  }

  //modelViewMatrix = lookAt( camera, vec3(0,0,0), vec3(0,1,0));
  //console.log(Math.sqrt(25));

  translationMatrix = translate(pointLightCord.x,5,pointLightCord.z);
  modelViewMatrix = mult(modelViewMatrix,translationMatrix);



  gl.uniformMatrix4fv(
  programInfo.uniformLocations.modelViewMatrix,
  false,
  flatten(modelViewMatrix));
  gl.uniform4fv( 
      programInfo.uniformLocations.colorLocation, [1, 1, 1, 1]); 
  gl.uniform1i(
      gl.getUniformLocation(shaderProgram, 'enableLight'), false);
  gl.drawArrays(gl.LINES, 0,24);
}



//online code
function mousedown(event) {
    var x = event.clientX;
    var y = event.clientY;
    var rect = event.target.getBoundingClientRect();
    var state = [];
    // If we're within the rectangle, mouse is down within canvas.
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      mouseState.lastX = x;
      mouseState.lastY = y;
      mouseState.dragged = true;
    }
}

function mouseup(event) {
  mouseState.dragged = false;
}

function mousemove(event) {
    var x = event.clientX;
    var y = event.clientY;
    if (mouseState.dragged && event.which == 3) {
      // The rotation speed factor
      // dx and dy here are how for in the x or y direction the mouse moved
      
      var dx = (x - mouseState.lastX);
      var dy = (y - mouseState.lastY);

      // update the latest angle
      rotation.x = rotation.x + dy;
      rotation.y = rotation.y + dx;
    }
    if (mouseState.dragged && event.which == 1) {
      // The rotation speed factor
      // dx and dy here are how for in the x or y direction the mouse moved
      var factor = 10/canvas.height;
      var dx = factor*(x - mouseState.lastX);
      var dy = factor*(y - mouseState.lastY);
      // update the latest angle
      translation.x = translation.x + dx;
      translation.y = translation.y + dy;
    }
    // update the last mouse position
    mouseState.lastX = x;
    mouseState.lastY = y;

  }
