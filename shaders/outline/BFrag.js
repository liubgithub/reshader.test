const b_frag = `
precision highp float;
uniform float opacity;
uniform sampler2D tDiffuse;
varying vec2 vUv;
void main() {
    vec4 texel = texture2D( tDiffuse, vUv );
    gl_FragColor = opacity * texel;
}
`;
export default b_frag;
