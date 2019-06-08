const quadScene_frag = `
precision mediump float;
varying vec2 vUv;

uniform sampler2D sceneTexture;

void main()
{
    vec4 sceneColor = texture2D(sceneTexture, vUv);
    gl_FragColor = sceneColor;
}`;

export default quadScene_frag;

