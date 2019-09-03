const bloompoints_frag = `
precision highp float;
precision highp int;
#define SHADER_NAME ShaderMaterial
#define KERNEL_SIZE_FLOAT 25.0
#define KERNEL_SIZE_INT 25
#define GAMMA_FACTOR 2
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
uniform float cKernel[KERNEL_SIZE_INT];
uniform sampler2D tDiffuse;
uniform vec2 uImageIncrement;
varying vec2 vUv;
void main() {
    vec2 imageCoord = vUv;
    vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );
    for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {
        sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];
        imageCoord += uImageIncrement;
    }
    gl_FragColor = sum;
}
`;
export default bloompoints_frag;
