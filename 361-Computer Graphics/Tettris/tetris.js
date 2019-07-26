//Core idea: 
//Collission detection: erase current block, redraw the new block, see if any conflict

// "Global Variables" that are used throughout the whole app
var canvas;
var gl;
var currentXPosition;
var currentHeight;
var blockID;
var blockRotation;
var matrix;

var program;
var vBuffer;
var gameStatus = 'running';
var block;

document.addEventListener("keydown", function(event) {
	//If the game is not running, none of the control work
	if(gameStatus == 'running'){
		if(event.keyCode == 32){
			while(checkStop(matrix)){
		    	matrixRemoveBlock(currentHeight,currentXPosition);
		        currentHeight --;
		        drawMatrixBoard(currentHeight, currentXPosition);
	    	}
		}
	    if(event.keyCode == 37){
	        if(currentXPosition>0){
	        	matrixRemoveBlock(currentHeight,currentXPosition);
	        	if( matrixCheckBlockSide(currentHeight, currentXPosition -1)){
	        		currentXPosition --;
	        	}
	        	drawMatrixBoard(currentHeight, currentXPosition);
	        	
	        }
	    }
	    if(event.keyCode == 39){
	    	if(currentXPosition+block[0].length<10){
		    	matrixRemoveBlock(currentHeight,currentXPosition);
	        	if( matrixCheckBlockSide(currentHeight, currentXPosition +1)){
	        		currentXPosition ++;
	            	drawMatrixBoard(currentHeight, currentXPosition);
	        	}else{
	        		drawMatrixBoard(currentHeight, currentXPosition);
	        	}
		    }
	    }
	    if(event.keyCode == 38){
	    	var tempBlockRotation = (blockRotation+1)%4;
	    	matrixRemoveBlock(currentHeight, currentXPosition);
	    	var rotationCollisionStatus = matrixCheckRotationCollision(currentHeight, currentXPosition, tempBlockRotation);

	    	if(rotationCollisionStatus.noCollision){
	    		blockRotation = (blockRotation+1)%4;
	    		block = generateBlock(blockID, blockRotation);
	    		currentHeight = rotationCollisionStatus.heightChange;
	    		currentXPosition = rotationCollisionStatus.xChange;
	    	}

	    	drawMatrixBoard(currentHeight, currentXPosition);
	    }
	    if(event.keyCode == 40){
	    	if(checkStop(matrix)){
		    	matrixRemoveBlock(currentHeight,currentXPosition);
		        currentHeight --;
		        drawMatrixBoard(currentHeight, currentXPosition);
	    	}
	    }
	}
	//Quitting the Game
    if(event.keyCode == 81){
        gameStatus = 'stopped';
        document.getElementById("gameStatus").innerHTML = 'Game Status: Game Quit. Gameplay stopped, press R to restart';
    }
    //Restarting the Game with a new board
    if(event.keyCode == 82 && gameStatus == 'stopped'){
    	gameStatus = 'running';
    	document.getElementById("gameStatus").innerHTML = 'Game Status: Game Running.';
    	matrix = initMatrix();
    	gameplay(matrix);
    }
})

//Specifying the background grid 
var gridMatrix = [];
var gridLineTemp = 1;
for(var i=0; i<38; i++){
    if(i%2 == 0){
        gridLineTemp = gridLineTemp - 0.1;
        gridLineTemp = format2Digit(gridLineTemp);
        gridMatrix[i] = [1, gridLineTemp];
    }else{
        gridMatrix[i] = [-1, gridLineTemp];
    }
}
gridLineTemp = 1;
for(i=38; i<56; i++){
    if(i%2 == 0){
        gridLineTemp = gridLineTemp - 0.2;
        gridLineTemp = format2Digit(gridLineTemp);
        gridMatrix[i] = [gridLineTemp, 1];
    }else{
        gridMatrix[i] = [gridLineTemp, -1];
    }
}

//the first call to start the game
matrix = initMatrix();
gameplay(matrix);

//core function, generates blocks
function gameplay(matrix){
    if(gameStatus =='stopped'){
        return;
    }
    var row20Sum = matrix[20].reduce((a, b) => a + b, 0);
    if(row20Sum != 0){
        gameStatus ='stopped';
        
        document.getElementById("gameStatus").innerHTML = 'Game Status: Game Over. Gameplay stopped, press R to restart';
        matrix = initMatrix();
        drawMatrixBoard(currentHeight,currentXPosition);
        return;
    }

    blockID = Math.floor(Math.random() * 7); 
    blockRotation = Math.floor(Math.random() * 4); 
    block = generateBlock(blockID, blockRotation);
    currentXPosition = Math.floor(Math.random() * 9);
    if(currentXPosition + block[0].length > 9)
    	currentXPosition = 10 - block[0].length;
    currentHeight = 20;
   
    clearFullRow(render);
}

//keep drawing the block until the block is stopped
function render(matrix){
    if(checkStop(matrix)){
    	matrixRemoveBlock(currentHeight,currentXPosition);
        currentHeight --;
        drawMatrixBoard(currentHeight, currentXPosition);
        setTimeout(function(){render(matrix)}, 800);
    } else {
    	//if the block is at the bottom, generate another block
        gameplay(matrix);
    }
}

//check for any full rows
function clearFullRow(callback){
	var fullRow;
	var i=0;
	while(i<20){
		fullRow = true;
		for(var j=0; j<10; j++){
   			if(matrix[i][j] ==0){
   				fullRow = false;
   			}
   		}
   		if(fullRow){
			for(var k=i; k<24; k++){
   				matrix[k] = matrix[k+1];
   				i = -1;
   			}
   			for(var l=20; l<24; l++){
   				matrix[l] = [0,0,0,0,0,0,0,0,0,0];
   			}
   		}

   		i++;
	}
   	callback(matrix);
}

//check if the block can legally rotate
function matrixCheckRotationCollision(tempCurrentHeight, tempCurrentXPosition, tempBlockRotation){
	var tempBlock = generateBlock(blockID, tempBlockRotation);
	var noCollision = true;
	var tempBlockHeight = tempBlock.length
	switch(blockID){
		case 0:
		 	break;
		case 1:
		 	if(tempBlockRotation%2 ==0){
		 		tempCurrentHeight = tempCurrentHeight -2;
		 		tempCurrentXPosition = tempCurrentXPosition +2;
		 	}
		 	if(tempBlockRotation%2 ==1){
		 		tempCurrentHeight = tempCurrentHeight +2;
		 		tempCurrentXPosition = tempCurrentXPosition -2;
		 	}
		 	break;
		case 2:
			if(tempBlockRotation%2 ==0){
		 		tempCurrentXPosition --;
		 	}
		 	if(tempBlockRotation%2 ==1){
		 		tempCurrentXPosition ++;
		 	}
		 	break;
		case 3:
			if(tempBlockRotation%2 ==0){
		 		tempCurrentXPosition --;
		 	}
		 	if(tempBlockRotation%2 ==1){
		 		tempCurrentXPosition ++;
		 	}
		 	break;
		case 4:
			if(tempBlockRotation%4 ==0){
		 	}
		 	if(tempBlockRotation%4 ==1){
		 		tempCurrentXPosition ++;
		 	}
		 	if(tempBlockRotation%4 ==2){
		 		tempCurrentHeight ++;
		 		tempCurrentXPosition --;
		 	}
		 	if(tempBlockRotation%4 ==3){
		 		tempCurrentHeight --;
		 	}
		 	break;
		case 5:
			if(tempBlockRotation%4 ==0){
		 	}
		 	if(tempBlockRotation%4 ==1){
		 		tempCurrentXPosition ++;
		 	}
		 	if(tempBlockRotation%4 ==2){
		 		tempCurrentHeight ++;
		 		tempCurrentXPosition --;
		 	}
		 	if(tempBlockRotation%4 ==3){
		 		tempCurrentHeight --;
		 	}
		 	break;
		case 6:
			if(tempBlockRotation%4 ==0){
		 	}
		 	if(tempBlockRotation%4 ==1){
		 		tempCurrentXPosition ++;
		 	}
		 	if(tempBlockRotation%4 ==2){
		 		tempCurrentHeight ++;
		 		tempCurrentXPosition --;
		 	}
		 	if(tempBlockRotation%4 ==3){
		 		tempCurrentHeight --;
		 	}
		 	break;
    }

    if(tempCurrentXPosition+block.length > 10 || tempCurrentXPosition < 0){
    	return {noCollision: false, heightChange:0, xChange: 0};
    }

    for(var x=0; x< tempBlockHeight; x++){
        for(var y=0; y< tempBlock[x].length; y++){
        	if(tempBlock[x][y] != 0){
	           	if(matrix[tempCurrentHeight+tempBlockHeight-x-1][y+tempCurrentXPosition] != 0)
	                noCollision = false;
	        }
        }
    }
    return {noCollision: noCollision, heightChange:tempCurrentHeight, xChange: tempCurrentXPosition};
}

//check if side movement is legal
function matrixCheckBlockSide(tempCurrentHeight, tempCurrentXPosition){
	var noColission = true;
	var blockHeight = block.length;

    for(var x=0; x< blockHeight; x++){
        for(var y=0; y< block[x].length; y++){
        	if(block[x][y] != 0){
	           	if(matrix[tempCurrentHeight+blockHeight-x-1][y+tempCurrentXPosition] != 0)
	                noColission = false;
	        }
        }
    }
    return noColission;
}

//generate vertexies
function drawMatrixBoard(tempCurrentHeight, tempCurrentXPosition){	
    var blockHeight = block.length
    for(var x=0; x< blockHeight; x++){
        for(var y=0; y< block[x].length; y++){
            if(block[x][y] != 0)
                matrix[tempCurrentHeight+blockHeight-x-1][y+tempCurrentXPosition] = block[x][y];
        }
    }
    var glDrawMatrix = convertMatrix(matrix);
    glDrawTetris(glDrawMatrix);
}

//erasing the current block
function matrixRemoveBlock(tempCurrentHeight, tempCurrentXPosition){
	var blockHeight = block.length;
	for(var x=0; x< blockHeight; x++){
        for(var y=0; y< block[x].length; y++){
            if(block[x][y] != 0){
            	matrix[tempCurrentHeight+blockHeight-x-1][y+tempCurrentXPosition] = 0;
            }
        }
    }
}

//check if the block is stopped
function checkStop(matrix){
    if(gameStatus=='stopped'){
        return false;
    }
    if(currentHeight ==0){
    	return false;
    }
    //check if any block is below them
    var collisionStatus = false;
    var scanRay = [];
    var tempSub;
    var blockHeight = block.length;
    //parse out empty tiles in the block
    for(var i=0; i<block[0].length; i++){
        tempSub = 0;
        if(block[blockHeight-1][i] == 0){
            tempSub = 1;
            if(block[blockHeight-2][i] == 0){
                tempSub = 2;
            }
        }
        scanRay.push(tempSub);
    }
    //detect if any of the tiles below has colission
    for(var i=0; i<scanRay.length; i++){
        if(matrix[currentHeight-1+scanRay[i]][currentXPosition+i] != 0){
            collisionStatus = true;
        }
    }

    if(collisionStatus){
        return false;
    }
    return true;
}

//create an empty 10 by 20 matrix
function initMatrix(){
    var matrix = [];
    for(var i=0; i<25; i++) {
        matrix[i] = [];
        for(var j=0; j<10; j++) {
            matrix[i][j] = 0;   
        }
    }
    return matrix;
}

//generate the block based on ID and rotation
function generateBlock(blockID, blockRotation){
	switch(blockID){
		case 0:
		 	return OShape(blockRotation);
		case 1:
		 	return IShape(blockRotation);
		case 2:
		 	return SShape(blockRotation);
		case 3:
		 	return ZShape(blockRotation);
		case 4:
		 	return LShape(blockRotation);
		case 5:
		 	return JShape(blockRotation);
		case 6:
		 	return TShape(blockRotation);
    }
}

function OShape(rotation = 0){
    return [[1,1],[1,1]];
}

function IShape(rotation = 0){
    if(rotation%2==0)
        return [[2],[2],[2],[2]];
    if(rotation%2==1)
        return [[2,2,2,2]];
}

function SShape(rotation = 0){
    if(rotation%2 == 0)
        return [[0,3,3],[3,3,0]];
    if(rotation%2==1)
        return [[3,0],[3,3],[0,3]];
}

function ZShape(rotation = 0){
    if(rotation%2 == 0)
        return [[4,4,0],[0,4,4]];
    if(rotation%2==1)
        return [[0,4],[4,4],[4,0]];
}

function LShape(rotation = 0){
    if(rotation ==0)
        return [[5,5,5],[5,0,0]];
    if(rotation ==1)
        return [[5,0],[5,0],[5,5]];
    if(rotation ==2)
        return [[0,0,5],[5,5,5]];
    if(rotation ==3)
        return [[5,5],[0,5],[0,5]];
}

function JShape(rotation = 0){
    if(rotation ==0)
        return [[6,6,6],[0,0,6]];
    if(rotation ==1)
        return [[6,6],[6,0],[6,0]];
    if(rotation ==2)
        return [[6,0,0],[6,6,6]];
    if(rotation ==3)
        return [[0,6],[0,6],[6,6]];
}

function TShape(rotation = 0){
    if(rotation ==0)
        return [[7,7,7],[0,7,0]];
    if(rotation ==1)
        return [[7,0],[7,7],[7,0]];
    if(rotation ==2)
        return [[0,7,0],[7,7,7]];
    if(rotation ==3)
        return [[0,7],[7,7],[0,7]];
}

//Draw the tetris board
function glDrawTetris(glDrawMatrix){
    canvas = document.getElementById( "tetris-board" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    // Creating the vertex buffer
    vBuffer = gl.createBuffer();

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Binding the vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
     
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );   

    var fColorLocation = gl.getUniformLocation(program, "fColor");
    gl.clear( gl.COLOR_BUFFER_BIT ); 

    glDrawMatrix.forEach(function(color){
        if(color.color==1 && color.vertex){
            draw(color.vertex, gl.TRIANGLES, color.vertex.length, 1,0.9,0,1);
        }
        if(color.color==2 && color.vertex){
            draw(color.vertex, gl.TRIANGLES, color.vertex.length, 0,0.7,1,1);
        }
        if(color.color==3 && color.vertex){
            draw(color.vertex, gl.TRIANGLES, color.vertex.length, 0,0.8,0,1);
        }
        if(color.color==4 && color.vertex){
            draw(color.vertex, gl.TRIANGLES, color.vertex.length, 0.8,0,0,1);
        }
        if(color.color==5 && color.vertex){
            draw(color.vertex, gl.TRIANGLES, color.vertex.length, 1,0.5,0,1);
        }
        if(color.color==6 && color.vertex){
            draw(color.vertex, gl.TRIANGLES, color.vertex.length, 0,0.3,0.8,1);
        }
        if(color.color==7 && color.vertex){
            draw(color.vertex, gl.TRIANGLES, color.vertex.length, 0.8,0,0.8,1);
        }
    });

    drawGrid();

    function draw(variable, glType, vertexCount, r,g,b,a){
        gl.bufferData( gl.ARRAY_BUFFER, flatten(variable), gl.STATIC_DRAW ); 
        gl.uniform4f(fColorLocation, r, g, b, a);  
        gl.drawArrays( glType, 0, vertexCount );
    }

    function drawGrid(){
        gl.bufferData( gl.ARRAY_BUFFER, flatten(gridMatrix), gl.STATIC_DRAW );  
        gl.uniform4f(fColorLocation, 1, 1, 1, 1);
        gl.drawArrays( gl.LINES, 0, 56 );
    }
}

//Convert matrix into rows and columns
function convertMatrix(matrix){
    var glDrawMatrix = [];
    var tempOccuranceMatch;
    var tempOccuranceMatchVertexLocation;

    for(k=1; k<8; k++){
        tempOccuranceMatch = [];
        tempOccuranceMatch = findOccurances(matrix,k);
        if(tempOccuranceMatch){
            tempOccuranceMatchVertexLocation = calculateVertexCorners(tempOccuranceMatch);
            glDrawMatrix.push({'color': k, 'vertex': tempOccuranceMatchVertexLocation});
        }
    }
    return glDrawMatrix;
}

//find vertex positions for rows and columns
function calculateVertexCorners(matchMatrix){
    var x1,x2,y1,y2;
    var result = [];
    var tempVertexHolder = [];
    matchMatrix.forEach(function(tile){
        x1 = format2Digit(tile.col*0.2 -1);
        x2 = format2Digit(tile.col*0.2 -0.8);
        y1 = format2Digit(tile.row*0.1 -1);
        y2 = format2Digit(tile.row*0.1 -0.9);

        tempVertexHolder = [
            [x1, y2],
            [x2, y2],
            [x2, y1],
            [x1, y2],
            [x1, y1],
            [x2, y1]
        ];
        result = result.concat(tempVertexHolder);
    });
    return result;
}

//find the position of each occurance of a number
function findOccurances(matrix, occuranceNumber){
    var tempMatch = [];
    var occuranceMatch = [];
    for(var i=0; i<20; i++){
        for(var j=0; j<10; j++){
            if(matrix[i][j] == occuranceNumber){
                occuranceMatch.push({'row':i, 'col':j});
            }
        }
    }
    if(occuranceMatch.length > 0){
        return occuranceMatch;
    } else {
        return false;
    }
}

function format2Digit(number){
    return parseFloat(number.toFixed(1));
}