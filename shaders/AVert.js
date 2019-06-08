const a_vert = `
precision highp float;
precision highp int;
#define SHADER_NAME ShaderMaterial
#define VERTEX_TEXTURES
#define GAMMA_FACTOR 2
#define MAX_BONES 0
#define BONE_TEXTURE
#define DOUBLE_SIDED
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
attribute vec3 POSITION;
attribute vec3 normal;
attribute vec2 uv;
#ifdef USE_TANGENT
    attribute vec4 tangent;
#endif
#ifdef USE_COLOR
    attribute vec3 color;
#endif
#ifdef USE_MORPHTARGETS
    attribute vec3 morphTarget0;
    attribute vec3 morphTarget1;
    attribute vec3 morphTarget2;
    attribute vec3 morphTarget3;
    #ifdef USE_MORPHNORMALS
        attribute vec3 morphNormal0;
        attribute vec3 morphNormal1;
        attribute vec3 morphNormal2;
        attribute vec3 morphNormal3;
    #else
        attribute vec3 morphTarget4;
        attribute vec3 morphTarget5;
        attribute vec3 morphTarget6;
        attribute vec3 morphTarget7;
    #endif
#endif
#ifdef USE_SKINNING
    attribute vec4 skinIndex;
    attribute vec4 skinWeight;
#endif

varying vec4 projTexCoord;
varying vec4 vPosition;
uniform mat4 textureMatrix;
void main() {
    vPosition = modelViewMatrix * vec4(POSITION, 1.0);
    vec4 worldPosition = modelMatrix * vec4(POSITION, 1.0);
    projTexCoord = textureMatrix * worldPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(POSITION, 1.0 );
}`;

export default a_vert;
