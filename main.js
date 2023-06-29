let eye;
let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);
let modelViewMatrix;
let modelViewMatrixLoc;
let projectionMatrix;
let projectionMatrixLoc;
let tempMatrix;
let stopTranslate;
let stopRotate;
let lampTranslate;
let carTranslate;
let carRotate;
let streetTranslate;
let bunnyTranslate;
let program;

let stopSign;
let lamp;
let car;
let street;
let bunny;

var lightPosition = vec4(1.0, 7.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

let scene = [];
let gl;
let cameraMove = false;
let theta = 0;
let bobbing = 0;
let alpha;
let ifAmbient = false;
let ifCloseUp = false;
let isShadow = false;
let animate = false;
let isSkyBox = false;
let isReflection = false;
let isRefraction = false;

let m;
let stack;
var cubeMap;



function main() {
    m = mat4();
    m[3][3] = 0;
    m[3][2] = -1/lightPosition[2];
    m[3][1] = 0;

    var image = new Image();
    image.crossOrigin = "";
    image.src = "https://web.cs.wpi.edu/~jmcuneo/cs4731/project2/stop.png";
    image.onload = function () {
        configureTexture(image);
    }
    var imageOne = new Image();
    var imageTwo = new Image();
    var imageThree = new Image();
    var imageFour = new Image();
    var imageFive = new Image();
    var imageSix = new Image();
    configureImage(imageOne, "https://web.cs.wpi.edu/~jmcuneo/cs4731/project2/skybox_negx.png");
    configureImage(imageTwo, "https://web.cs.wpi.edu/~jmcuneo/cs4731/project2/skybox_negy.png");
    configureImage(imageThree, "https://web.cs.wpi.edu/~jmcuneo/cs4731/project2/skybox_negz.png");
    configureImage(imageFour, "https://web.cs.wpi.edu/~jmcuneo/cs4731/project2/skybox_posx.png");
    configureImage(imageFive, "https://web.cs.wpi.edu/~jmcuneo/cs4731/project2/skybox_posy.png");
    configureImage(imageSix, "https://web.cs.wpi.edu/~jmcuneo/cs4731/project2/skybox_posz.png");
    // Get the stop sign
    stopSign = new Model(
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
    gl.enable(gl.DEPTH_TEST);

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

    projectionMatrix = perspective(90, canvas.width / canvas.height, 0.1, 100.0);
    projectionMatrixLoc = gl.getUniformLocation(program, 'projectionMatrix');
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    eye = vec3(0.0, 4.0, 5.0);


    modelViewMatrix = lookAt(eye, at, up);
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.uniform4fv(gl.getUniformLocation(program, "diffuseLight"), flatten(lightDiffuse));
    gl.uniform4fv(gl.getUniformLocation(program, "specularLight"), flatten(lightSpecular));
    gl.uniform4fv(gl.getUniformLocation(program, "ambientLight"), flatten(lightAmbient));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));

    window.addEventListener("keydown" , handleKey);

    renderObject(stopSign, 1);
    renderObject(lamp, 2);
    renderObject(car, 3);
    renderObject(street, 4);
    renderObject(bunny, 5);
    helperRender();
}
function handleKey(event)
{
    var key = event.key;
    switch (event.key) {
        case 'L':

            ifAmbient = !ifAmbient;
            helperRender();
            break;

        case 'C':
            cameraMove = !cameraMove;
            helperRender();

            break;
        case 'M':
            animate = !animate;
            helperRender();

            break;
        case 'D':
            ifCloseUp = !ifCloseUp;
            if(ifCloseUp)
            {
                modelViewMatrix = lookAt(vec3(3.0, 1.4, -1.2), vec3(2.5, 0.8, -1.2), vec3(0.0, 1.0, 0.0));
                modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
                gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
            }
            else
            {
                modelViewMatrix = lookAt(eye, at, up);
                modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
                gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
            }
            helperRender();
            break;
        case 'S':
            isShadow= !isShadow;
            if(isShadow) {
                let fColor = gl.getUniformLocation(program, "fColor");
                let modelMatrix = translate(lightPosition[0], lightPosition[1], lightPosition[2]);
                modelMatrix = mult(modelMatrix, m);
                modelMatrix = mult(modelMatrix, translate(-lightPosition[0], -lightPosition[1], -lightPosition[2]));

                modelViewMatrix = mult(modelViewMatrix, modelMatrix);

                modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
                gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
                gl.uniform4fv(fColor, flatten(vec4(0,0,0,1)));
                gl.drawArrays(gl.TRIANGLES, 0, car.vert.length);
                helperRender();
            }
            else
            {
                modelViewMatrix = lookAt(eye, at, up);
                modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
                gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
                helperRender();
            }
            break;
        case 'E':
            isSkyBox =! isSkyBox
            helperRender();

            break;
        case 'R':
            isReflection =! isReflection;
            helperRender();

            break;
        case 'F':
            isRefraction =! isRefraction;
            helperRender();

            break;


    }
}

function renderObject(object, num) {
    if (object.objParsed && object.mtlParsed) {
        for (let i = 0; i < object.faces.length; i++) {
            let diffMap = object.diffuseMap.get(object.faces[i].material);
            let specMap = object.specularMap.get(object.faces[i].material);
            for (let j = 0; j < object.faces[i].faceVertices.length; j++) {
                object.norm.push(object.faces[i].faceNormals[j]);
                object.vert.push(object.faces[i].faceVertices[j]);
                object.diffuse.push(diffMap);
                object.specular.push(specMap);
            }
            for (let k = 0; k < object.faces[i].faceTexCoords.length; k++) {
                object.text.push(object.faces[i].faceTexCoords[k]);
            }
        }
        scene.push(object);
    } else {
        requestAnimationFrame(function () {
            renderObject(object, num);
        });
    }
}

function helperRender() {
    if (scene.length === 5) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearColor(0, 0, 0, 1.0);
        finishRender();
    } else {
        requestAnimationFrame(function () {
            helperRender();
        });
    }
}

function finishRender() {
    placement(stopSign);
    render(stopSign, 1);
    placement(lamp);
    render(lamp, 2);
    placement(car);
    //WORKS SOMETIMES BUT BREAKS THE CODE WHEN M IS PRESSED FOR ANIMATE
    // if(animate)
    // {
    //     alpha+=0.5;
    //     let carRotate = rotate(alpha, [0,1,0])
    //     tempMatrix = mult(carRotate, tempMatrix);
    //     gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(tempMatrix));
    //
    // }
    // stack.push(tempMatrix);
    render(car, 3);
    placement(bunny);
    render(bunny, 5);
    placement(street);
    render(street, 4);

    if(cameraMove){
        if(theta === 360)
        {
            theta = 0;
        }
        else {
            theta++;
        }
        if((theta < 90) || ((theta > 180) && (theta < 270 ))) {
            bobbing +=0.01;
        }
        if(((theta > 90) && (theta < 180)) || ((theta > 270) && (theta < 360))) {
            bobbing-=0.01;
        }
        let tempTranslate = translate(0,bobbing,0);
        let rotationMatrix = rotate(theta, [0,1, 0]);
        let cMatrix = mult(tempTranslate, rotationMatrix);
        cMatrix = mult(cMatrix, vec4(eye));
        modelViewMatrix = lookAt(vec3(cMatrix), at, up);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    }
    requestAnimationFrame(finishRender);
}

function render(object, num) {
    if (num === 1) {
        gl.uniform1i(gl.getUniformLocation(program, "stop"), 1);
        placement(object);
        drawStop(object);
    } else {
        gl.uniform1i(gl.getUniformLocation(program, "stop"), 0);
    }
    if(ifAmbient){
        gl.uniform1i(gl.getUniformLocation(program, "ifAmbient"), 1);
    }else{
        gl.uniform1i(gl.getUniformLocation(program, "ifAmbient"), 0);
    }

    var vNormal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(object.norm), gl.STATIC_DRAW);

    var vNormalPosition = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormalPosition);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(object.vert), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var diffBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, diffBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(object.diffuse), gl.STATIC_DRAW);

    var vMaterialDiffuse = gl.getAttribLocation(program, "vMaterialDiffuse");
    gl.vertexAttribPointer(vMaterialDiffuse, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vMaterialDiffuse);

    var specBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, specBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(object.specular), gl.STATIC_DRAW);

    var vMaterialSpecular = gl.getAttribLocation(program, "vMaterialSpecular");
    gl.vertexAttribPointer(vMaterialSpecular, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vMaterialSpecular);


    gl.drawArrays(gl.TRIANGLES, 0, object.vert.length);


}

function drawStop(object) {
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(object.text), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);
}


function configureTexture(image) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}


function placement(object) {
    if (object === stopSign) {
        stopTranslate = translate(2, 0, -4);
        stopRotate = rotate(270, [0, 1, 0]);
        tempMatrix = mult(modelViewMatrix, mult(stopTranslate, stopRotate));

    }
    if (object === lamp) {
        lampTranslate = translate(0, 0, 0);
        tempMatrix = mult(modelViewMatrix, lampTranslate);
    }
    if (object === car) {
        carRotate = rotate(180, [0, 1, 0]);
        carTranslate = translate(2.7, 0, 0);
        tempMatrix = mult(modelViewMatrix, mult(carTranslate, carRotate));

    }
    if (object === street) {
        streetTranslate = translate(0, 0, 0);
        tempMatrix = mult(modelViewMatrix, streetTranslate);
    }
    if (object === bunny) {
        bunnyTranslate = translate(2.5, 0.8, -1.2);
        //WORKS SOMETIMES BUT BREAKS THE CODE WHEN M IS PRESSED FOR ANIMATE
        // if(animate)
        // {
        //     bunnyTranslate = mult(bunnyTranslate, stack.pop());
        // }
        tempMatrix = mult(modelViewMatrix, bunnyTranslate);
    }

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(tempMatrix));
}
function configureImage(image, link){
    image.crossOrigin = "";
    image.src = link;
    image.onload = function() {
        configureCubeMapImage(image);
    }
}
function configureCubeMapImage(image) {
    cubeMap = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 1);
}



