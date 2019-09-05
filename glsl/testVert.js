const testVert = `
precision mediump float;

attribute vec3 POSITION;
uniform mat4 projViewModelMatrix;

void main() {
    gl_Position = projViewModelMatrix * vec4(POSITION, 1);
}`;
export default testVert;
