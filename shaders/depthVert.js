const depth_vert = `
    precision mediump float;
    attribute vec3 POSITION;
    uniform mat4 projViewModelMatrix;
    void main() {
        gl_Position = projViewModelMatrix * vec4(POSITION, 1.0);
    }`;
export default depth_vert;