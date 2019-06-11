const outline_vert =
`attribute vec2 POSITION;
#define KERNEL_SIZE_FLOAT 25.0
uniform vec2 uImageIncrement;
varying vec2 vUv;
void main() {
    vUv = 0.5 * (POSITION + 1.0);
    #ifdef USE_KERNEL_SIZE
        vUv = vUv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;
    #endif
    gl_Position = vec4(POSITION, 0.0, 1.0);
}`;

export default outline_vert;

