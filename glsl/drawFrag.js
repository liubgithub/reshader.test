const drawFrag = `precision mediump float;

uniform sampler2D u_wind;
uniform vec2 u_wind_min;
uniform vec2 u_wind_max;
uniform sampler2D u_color_ramp;

varying vec2 v_particle_pos;
varying vec4 vColor;
uniform vec4 extent;


vec2 getNewUV(vec2 v_particle_pos) {
    float xmin = (extent.x + 180.0) / 360.0;
    float ymin = (extent.z + 90.0) / 180.0;
    float xmax = (extent.y + 180.0) / 360.0;
    float ymax = (extent.w + 90.0) / 180.0;
    float xWidth = xmax - xmin;
    float yHeight = ymax - ymin;
    vec2 centerUv = vec2((xmin + xmax) / 2.0, (ymin + ymax) / 2.0);
    //三象限
    if(v_particle_pos.x < centerUv.x && v_particle_pos.y < centerUv.y) {
        v_particle_pos.x = v_particle_pos.x * xWidth + xmin;
        v_particle_pos.y = v_particle_pos.y * yHeight + ymin;
    } else if(v_particle_pos.x < centerUv.x && v_particle_pos.y > centerUv.y) {
        v_particle_pos.x = v_particle_pos.x * xWidth + xmin;
        v_particle_pos.y = (v_particle_pos.y - 1.0) * yHeight + ymax ;
    } else if(v_particle_pos.x > centerUv.x && v_particle_pos.y < centerUv.y) {
        v_particle_pos.x = (v_particle_pos.x - 1.0) * xWidth + xmax;
        v_particle_pos.y = v_particle_pos.y * yHeight + ymin;
    } else if(v_particle_pos.x > centerUv.x && v_particle_pos.y > centerUv.y) {
        v_particle_pos.x = (v_particle_pos.x - 1.0) * xWidth + xmax;
        v_particle_pos.y = (v_particle_pos.y - 1.0) * yHeight + ymax;
    }
    return vec2(v_particle_pos.x, v_particle_pos.y);
}

void main() {
    vec2 particle_pos = getNewUV(v_particle_pos);
    vec2 velocity = mix(u_wind_min, u_wind_max, texture2D(u_wind, particle_pos).rg);
    // vec2 velocity = mix(u_wind_min, u_wind_max, texture2D(u_wind, v_particle_pos).rg);
    float speed_t = length(velocity) / length(u_wind_max);

    // color ramp is encoded in a 16x16 texture
    vec2 ramp_pos = vec2(
        fract(16.0 * speed_t),
        floor(16.0 * speed_t) / 16.0);

    gl_FragColor = texture2D(u_color_ramp, ramp_pos);
}`;
export default drawFrag;
