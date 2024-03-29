const points_vert = `
precision highp float;
precision highp int;
#define SHADER_NAME PointsMaterial
#define VERTEX_TEXTURES
#define GAMMA_FACTOR 2
#define MAX_BONES 0
#define USE_FOG 1
#define FOG_EXP2
#define BONE_TEXTURE
#define USE_SIZEATTENUATION 1
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
attribute vec3 POSITION;
attribute vec3 NORMAL;
attribute vec2 uv;
#ifdef USE_TANGENT
    attribute vec4 TANGENT;
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

uniform float size;
uniform float scale;
#define PI 3.14159265359
#define PI2 6.28318530718
#define PI_HALF 1.5707963267949
#define RECIPROCAL_PI 0.31830988618
#define RECIPROCAL_PI2 0.15915494
#define LOG2 1.442695
#define EPSILON 1e-6
#define saturate(a) clamp( a, 0.0, 1.0 )
#define whiteCompliment(a) ( 1.0 - saturate( a ) )
float pow2( const in float x ) {
    return x*x;
}
float pow3( const in float x ) {
    return x*x*x;
}
float pow4( const in float x ) {
    float x2 = x*x;
    return x2*x2;
}
float average( const in vec3 color ) {
    return dot( color, vec3( 0.3333 ) );
}
highp float rand( const in vec2 uv ) {
    const highp float a = 12.9898, b = 78.233, c = 43758.5453;
    highp float dt = dot( uv.xy, vec2( a, b ) ), sn = mod( dt, PI );
    return fract(sin(sn) * c);
}
struct IncidentLight {
    vec3 color;
    vec3 direction;
    bool visible;
};
struct ReflectedLight {
    vec3 directDiffuse;
    vec3 directSpecular;
    vec3 indirectDiffuse;
    vec3 indirectSpecular;
};
struct GeometricContext {
    vec3 position;
    vec3 normal;
    vec3 viewDir;
};
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
    return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
    return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
vec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
    float distance = dot( planeNormal, point - pointOnPlane );
    return - distance * planeNormal + point;
}
float sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
    return sign( dot( point - pointOnPlane, planeNormal ) );
}
vec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {
    return lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) ) + pointOnLine;
}
mat3 transposeMat3( const in mat3 m ) {
    mat3 tmp;
    tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
    tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
    tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
    return tmp;
}
float linearToRelativeLuminance( const in vec3 color ) {
    vec3 weights = vec3( 0.2126, 0.7152, 0.0722 );
    return dot( weights, color.rgb );
}
#ifdef USE_COLOR
    varying vec3 vColor;
#endif
#ifdef USE_FOG
    varying float fogDepth;
#endif
#ifdef USE_MORPHTARGETS
    #ifndef USE_MORPHNORMALS
        uniform float morphTargetInfluences[ 8 ];
    #else
        uniform float morphTargetInfluences[ 4 ];
    #endif
#endif
#ifdef USE_LOGDEPTHBUF
    #ifdef USE_LOGDEPTHBUF_EXT
        varying float vFragDepth;
    #else
        uniform float logDepthBufFC;
    #endif
#endif
#if 0 > 0 && ! defined( PHYSICAL ) && ! defined( PHONG ) && ! defined( MATCAP )
    varying vec3 vViewPosition;
#endif
void main() {
    #ifdef USE_COLOR
        vColor.xyz = color.xyz;
    #endif
    vec3 transformed = vec3( POSITION );
    #ifdef USE_MORPHTARGETS
        transformed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];
        transformed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];
        transformed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];
        transformed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];
        #ifndef USE_MORPHNORMALS
            transformed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];
            transformed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];
            transformed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];
            transformed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];
        #endif
    #endif
    vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = size;
    //#ifdef USE_SIZEATTENUATION
    //    bool isPerspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 );
    //    if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
    //#endif
    gl_PointSize *= ( scale / - mvPosition.z );
    #ifdef USE_LOGDEPTHBUF
        #ifdef USE_LOGDEPTHBUF_EXT
            vFragDepth = 1.0 + gl_Position.w;
        #else
            gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
            gl_Position.z *= gl_Position.w;
        #endif
    #endif
    #if 0 > 0 && ! defined( PHYSICAL ) && ! defined( PHONG ) && ! defined( MATCAP )
        vViewPosition = - mvPosition.xyz;
    #endif
    #if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP )
        vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );
    #endif
    #ifdef USE_FOG
        fogDepth = -mvPosition.z;
    #endif
}`;
export default points_vert;