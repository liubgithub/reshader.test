const screenFrag = `precision mediump float;

uniform sampler2D u_texture;

varying vec2 v_tex_pos;

void main() {
    vec4 color = texture2D(u_texture, v_tex_pos);
    // a hack to guarantee opacity fade out even with a value close to 1.0
    gl_FragColor = color;
}`;

export default screenFrag;
