const depth_vert = `
    precision mediump float;
    attribute vec3 aPosition;
    uniform mat4 projViewModelMatrix;
    void main() {
        gl_Position = projViewModelMatrix * vec4(aPosition, 1.0);
    }`;
export default depth_vert;