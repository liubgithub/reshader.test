const c_frag = `precision highp float;
precision highp int;
#define SHADER_NAME ShaderMaterial
#define GAMMA_FACTOR 2
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
#define TONE_MAPPING
#ifndef saturate
    #define saturate(a) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
uniform float toneMappingWhitePoint;
vec3 LinearToneMapping( vec3 color ) {
    return toneMappingExposure * color;
}
vec3 ReinhardToneMapping( vec3 color ) {
    color *= toneMappingExposure;
    return saturate( color / ( vec3( 1.0 ) + color ) );
}
#define Uncharted2Helper( x ) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )
vec3 Uncharted2ToneMapping( vec3 color ) {
    color *= toneMappingExposure;
    return saturate( Uncharted2Helper( color ) / Uncharted2Helper( vec3( toneMappingWhitePoint ) ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
    color *= toneMappingExposure;
    color = max( vec3( 0.0 ), color - 0.004 );
    return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 ACESFilmicToneMapping( vec3 color ) {
    color *= toneMappingExposure;
    return saturate( ( color * ( 2.51 * color + 0.03 ) ) / ( color * ( 2.43 * color + 0.59 ) + 0.14 ) );
}
vec3 toneMapping( vec3 color ) {
    return LinearToneMapping( color );
}
vec4 LinearToLinear( in vec4 value ) {
    return value;
}
vec4 GammaToLinear( in vec4 value, in float gammaFactor ) {
    return vec4( pow( value.rgb, vec3( gammaFactor ) ), value.a );
}
vec4 LinearToGamma( in vec4 value, in float gammaFactor ) {
    return vec4( pow( value.rgb, vec3( 1.0 / gammaFactor ) ), value.a );
}
vec4 sRGBToLinear( in vec4 value ) {
    return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 LinearTosRGB( in vec4 value ) {
    return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 RGBEToLinear( in vec4 value ) {
    return vec4( value.rgb * exp2( value.a * 255.0 - 128.0 ), 1.0 );
}
vec4 LinearToRGBE( in vec4 value ) {
    float maxComponent = max( max( value.r, value.g ), value.b );
    float fExp = clamp( ceil( log2( maxComponent ) ), -128.0, 127.0 );
    return vec4( value.rgb / exp2( fExp ), ( fExp + 128.0 ) / 255.0 );
}
vec4 RGBMToLinear( in vec4 value, in float maxRange ) {
    return vec4( value.rgb * value.a * maxRange, 1.0 );
}
vec4 LinearToRGBM( in vec4 value, in float maxRange ) {
    float maxRGB = max( value.r, max( value.g, value.b ) );
    float M = clamp( maxRGB / maxRange, 0.0, 1.0 );
    M = ceil( M * 255.0 ) / 255.0;
    return vec4( value.rgb / ( M * maxRange ), M );
}
vec4 RGBDToLinear( in vec4 value, in float maxRange ) {
    return vec4( value.rgb * ( ( maxRange / 255.0 ) / value.a ), 1.0 );
}
vec4 LinearToRGBD( in vec4 value, in float maxRange ) {
    float maxRGB = max( value.r, max( value.g, value.b ) );
    float D = max( maxRange / maxRGB, 1.0 );
    D = min( floor( D ) / 255.0, 1.0 );
    return vec4( value.rgb * ( D * ( 255.0 / maxRange ) ), D );
}
const mat3 cLogLuvM = mat3( 0.2209, 0.3390, 0.4184, 0.1138, 0.6780, 0.7319, 0.0102, 0.1130, 0.2969 );
vec4 LinearToLogLuv( in vec4 value ) {
    vec3 Xp_Y_XYZp = cLogLuvM * value.rgb;
    Xp_Y_XYZp = max( Xp_Y_XYZp, vec3( 1e-6, 1e-6, 1e-6 ) );
    vec4 vResult;
    vResult.xy = Xp_Y_XYZp.xy / Xp_Y_XYZp.z;
    float Le = 2.0 * log2(Xp_Y_XYZp.y) + 127.0;
    vResult.w = fract( Le );
    vResult.z = ( Le - ( floor( vResult.w * 255.0 ) ) / 255.0 ) / 255.0;
    return vResult;
}
const mat3 cLogLuvInverseM = mat3( 6.0014, -2.7008, -1.7996, -1.3320, 3.1029, -5.7721, 0.3008, -1.0882, 5.6268 );
vec4 LogLuvToLinear( in vec4 value ) {
    float Le = value.z * 255.0 + value.w;
    vec3 Xp_Y_XYZp;
    Xp_Y_XYZp.y = exp2( ( Le - 127.0 ) / 2.0 );
    Xp_Y_XYZp.z = Xp_Y_XYZp.y / value.y;
    Xp_Y_XYZp.x = value.x * Xp_Y_XYZp.z;
    vec3 vRGB = cLogLuvInverseM * Xp_Y_XYZp.rgb;
    return vec4( max( vRGB, 0.0 ), 1.0 );
}
vec4 mapTexelToLinear( vec4 value ) {
    return LinearToLinear( value );
}
vec4 matcapTexelToLinear( vec4 value ) {
    return LinearToLinear( value );
}
vec4 envMapTexelToLinear( vec4 value ) {
    return LinearToLinear( value );
}
vec4 emissiveMapTexelToLinear( vec4 value ) {
    return LinearToLinear( value );
}
vec4 linearToOutputTexel( vec4 value ) {
    return LinearToLinear( value );
}
varying vec2 vUv;
uniform sampler2D maskTexture;
uniform vec2 texSize;
uniform vec3 visibleEdgeColor;
uniform vec3 hiddenEdgeColor;
void main() {
    vec2 invSize = 1.0 / texSize;
    vec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);
    vec4 c1 = texture2D( maskTexture, vUv + uvOffset.xy);
    vec4 c2 = texture2D( maskTexture, vUv - uvOffset.xy);
    vec4 c3 = texture2D( maskTexture, vUv + uvOffset.yw);
    vec4 c4 = texture2D( maskTexture, vUv - uvOffset.yw);
    float diff1 = (c1.r - c2.r)*0.5;
    float diff2 = (c3.r - c4.r)*0.5;
    float d = length( vec2(diff1, diff2) );
    float a1 = min(c1.g, c2.g);
    float a2 = min(c3.g, c4.g);
    float visibilityFactor = min(a1, a2);
    vec3 edgeColor = 1.0 - visibilityFactor > 0.001 ? visibleEdgeColor : hiddenEdgeColor;
    gl_FragColor = vec4(edgeColor, 1.0) * vec4(d);
}`;

export default c_frag;
