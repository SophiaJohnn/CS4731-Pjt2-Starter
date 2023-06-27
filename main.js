let eye;
let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);
let modelViewMatrix;
let modelViewMatrixLoc;
let projectionMatrix;
let projectionMatrixLoc;
let program;

let stopSign;
let lamp;
let car;
let street;
let bunny;

let scene = [];
let gl;


function main()
{
    var image = new Image();
    image.crossOrigin = "";
    image.src = "https://web.cs.wpi.edu/~jmcuneo/cs4731/project2/stop.png";
    image.onload = function() {
        configureTexture( image );
    }
    // Get the stop sign
    stopSign = new Model (
        "http://web.cs.wpi.edu/~jmcuneo/cs4731/project3/stopsign.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project2/stopsign.mtl");

// Get the lamp
    lamp = new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/lamp.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/lamp.mtl");

// Get the car
    car = new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/car.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/car.mtl");

// Get the street
    street = new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/street.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/street.mtl");

// Get the bunny (you will not need this one until Part II)
    bunny = new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/bunny.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/bunny.mtl");

    // Retrieve <canvas> element
    let canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas, undefined);

    //Check that the return value is not null.
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    // Set viewport
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Set clear color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    projectionMatrix = perspective (90, canvas.width/canvas.height, 0.1, 100.0);
    projectionMatrixLoc = gl.getUniformLocation(program, 'projectionMatrix');
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    eye = vec3(0.0, 2.0, 5.0);
    modelViewMatrix = lookAt(eye, at, up);
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix" );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    renderObject(stopSign, 1);
    renderObject(lamp, 2);
    renderObject(car, 3);
    renderObject(street, 4);
    renderObject(bunny, 5);
    helperRender();
}

function renderObject(object, num)
{
    if(object.objParsed && object.mtlParsed) {
        for(let i=0; i<object.faces.length; i++){
            for (let j = 0; j < object.faces[i].faceVertices.length; j++){
                object.norm.push(object.faces[i].faceNormals[j]);
                object.vert.push(object.faces[i].faceVertices[j]);
                //object.text.push(object.faces[i].faceTexCoords[j]);
                // console.log(object.text);
            }
            for (let j = 0; j < object.faces[i].faceTexCoords.length; j++) {
                object.text.push(object.faces[i].faceTexCoords[j]);
                //console.log(object.text);
            }
        }
        scene.push(object);
    }else{
        requestAnimationFrame(function() {
            renderObject(object, num);
        });
    }
}
function helperRender()
{
    if(scene.length === 5){
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
        gl.clearColor(0, 0, 0, 1.0);
        finishRender();
    }else{
        requestAnimationFrame(function() {
            helperRender();
        });
    }
}
function finishRender()
{
    render(stopSign, 1);
    // render(lamp, 2);
    // render(car, 3);
    // render(street, 4);
    // render(bunny, 5);
}
function render(object, num)
{
    if(num === 1)
    {
        gl.uniform1i(gl.getUniformLocation(program, "stop"), 1);
        drawStop(object);
    }
    else
    {
        gl.uniform1i(gl.getUniformLocation(program, "stop"), 0);
        drawStop(object);
    }

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(object.vert), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.drawArrays(gl.TRIANGLES, 0, object.vert.length);




}

function drawStop(object)
{
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(object.text), gl.STATIC_DRAW );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vTexCoord);

}

function configureTexture(image)
{
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

// function drawOthers(object)
// {
//     var tBuffer = gl.createBuffer();
//     gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
//     gl.bufferData( gl.ARRAY_BUFFER, flatten(object.faces.faceVertices), gl.STATIC_DRAW );
//
//     var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
//     gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
//     gl.enableVertexAttribArray( vTexCoord );
//
//
//    //  createATexture();
//
//
//     var image = new Image();
//     image.crossOrigin = "";
//     //image.src = "http://web.cs.wpi.edu/~jmcuneo/grass.bmp";
//     image.src = "https://web.cs.wpi.edu/~jmcuneo/a.jpg";
//     //image.src = "SA2011_black.gif";
//     image.onload = function() {
//         configureTexture( image );
//     }
// }

