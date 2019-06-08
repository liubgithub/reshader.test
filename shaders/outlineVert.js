const outline_vert =
`attribute vec2 POSITION;
varying vec2 vUv;
void main() {
    gl_Position = vec4(POSITION, 0.0, 1.0);
    vUv = 0.5 * (POSITION + 1.0);
}`;

export default outline_vert;

