const quadVert = `precision mediump float;

attribute vec2 a_pos;
attribute vec2 uv;
varying vec2 v_tex_pos;

void main() {
    v_tex_pos = uv;
    gl_Position = vec4(a_pos, 0, 1);
}`;
export default quadVert;
