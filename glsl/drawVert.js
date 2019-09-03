const drawVert = `
precision mediump float;

attribute float a_index;

uniform sampler2D u_particles;
uniform float u_particles_res;
uniform vec2 res;

varying vec2 v_particle_pos;
varying vec4 vColor;

void main() {
    vec2 uv = vec2(fract(a_index / u_particles_res), floor(a_index / u_particles_res) / u_particles_res);
    vec4 color = texture2D(u_particles, uv);

    // decode current particle position from the pixel's RGBA value
    v_particle_pos = vec2(
        color.r / 255.0 + color.b,
        color.g / 255.0 + color.a);
    vColor = color;
    gl_PointSize = 1.0;
    gl_Position = vec4(2.0 * v_particle_pos.x - 1.0, 1.0 - 2.0 * v_particle_pos.y, 0, 1);
}`;
export default drawVert;
