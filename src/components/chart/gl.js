export const COLOR_BG = [1.0, 1.0, 1.0, 1.0];
export const COLOR = [1.0, 0.0, 0.0, 1.0];

function toFloatString(numbers) {
    const a = Array.isArray(numbers) ? numbers : [numbers];
    return a.map(n => n.toFixed(1)).join(', ');
}

export const mapNameToShadeSrc = {
    'Fragment': ['FRAGMENT_SHADER', `
        void main(void) {
            gl_FragColor = vec4(${toFloatString(COLOR)});
        }
    `],
    // gl_VertexID still unavailible so vertex shader needs x coord with idx
    'Vertex': ['VERTEX_SHADER', `
        attribute vec2 aVertPos;

        uniform float uMinY;
        uniform float uLastIdx;
        uniform float uDeltaY;
        
        void main(void) {
            float x = ((aVertPos.x / uLastIdx) - 0.5) * 2.0;
            float y = ((aVertPos.y - uMinY) / uDeltaY) * 2.0 - 1.0;
            gl_Position = vec4(x, y, 0, 1.0);
        }  
    `]
}


export function prepareVerticies(yCoordinates) {
    var vertecies = new Float32Array(yCoordinates.length << 1),
        i,
        idx = 0,
        max = yCoordinates[0],
        min = yCoordinates[0],
        y;

    for (i = 0; i < yCoordinates.length; i++) {
        y = yCoordinates[i];
        vertecies[idx++] = i; // set idx because gl_VertexID still not available
        vertecies[idx++] = y;
        if (y > max) {
            max = y;
        }
        if (y < min) {
            min = y;
        }
    }

    return {
        vertecies,
        max,
        min,
    };
}

export function createVertexBuffer(gl, bufferSize) {
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferSize * 4 * 2 , gl.STATIC_DRAW);
    vertexBuffer.itemSize = 2;
    vertexBuffer.numberOfItems = 0;
    return vertexBuffer;
}

export function getShader(gl, [type, source]) {
    const shader = gl.createShader(gl[type]);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);
   
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log("Shader compile error: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);   
        return null;
    }
    return shader;  
}

export function createShaders(gl, vertexBuffer) {
    const fragmentShader = getShader(gl, mapNameToShadeSrc.Fragment);
    const vertexShader = getShader(gl, mapNameToShadeSrc.Vertex);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
      
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Shaders init fail');
        return false;
    }
      
    gl.useProgram(shaderProgram);

    shaderProgram.attrPos = {
        vertex: gl.getAttribLocation(shaderProgram, "aVertPos"),
    };

    shaderProgram.unifPos = {
        minY: gl.getUniformLocation(shaderProgram, "uMinY"),
        lastIdx: gl.getUniformLocation(shaderProgram, "uLastIdx"),
        deltaY: gl.getUniformLocation(shaderProgram, "uDeltaY"),
    };

    gl.enableVertexAttribArray(shaderProgram.attrPos.vertex);
    gl.vertexAttribPointer(
        shaderProgram.attrPos.vertex, 
        vertexBuffer.itemSize, 
        gl.FLOAT, 
        false, 
        0,
        0
    );

    gl.uniform1f(shaderProgram.unifPos.minY, 0.0);
    gl.uniform1f(shaderProgram.unifPos.lastIdx, 0);
    gl.uniform1f(shaderProgram.unifPos.deltaY, 1.0);

    return shaderProgram;
}

export function updateVertexBuffer(glContext, yCoordinates) {
    const { gl, shaderProgram, vertexBuffer } = glContext;
    const { vertecies, min, max } = prepareVerticies(yCoordinates);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertecies);
    vertexBuffer.numberOfItems = vertecies.length / vertexBuffer.itemSize;

    gl.uniform1f(shaderProgram.unifPos.lastIdx, yCoordinates.length - 1);
    gl.uniform1f(shaderProgram.unifPos.minY, min);
    gl.uniform1f(shaderProgram.unifPos.deltaY, max - min);

    return glContext;
}

export function drawLineStrip(glContext) {
    const { gl, vertexBuffer } = glContext;

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(...COLOR_BG);
    gl.clear(gl.COLOR_BUFFER_BIT);
  
    gl.drawArrays(gl.LINE_STRIP, 0, vertexBuffer.numberOfItems);

    return glContext;
}

export function createGlContext(canvas, screenWidth) {
    try {
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

        const vertexBuffer = createVertexBuffer(gl, screenWidth);

        const shaderProgram = createShaders(gl, vertexBuffer);

        const glContext = {
            gl, 
            shaderProgram,
            vertexBuffer
        };

        return glContext;
    }
    catch(e) {
        console.error(e);
        return null;
    }
}