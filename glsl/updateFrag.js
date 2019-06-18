const updateFrag = `
precision mediump float;
uniform sampler2D u_particles;
uniform sampler2D u_wind;
uniform vec2 u_wind_res;
uniform vec2 u_wind_min;
uniform vec2 u_wind_max;
uniform float u_rand_seed;
uniform float u_speed_factor;
uniform float u_drop_rate;
uniform float u_drop_rate_bump;
uniform vec2 center;
uniform vec2 res;
uniform float level;
varying vec2 v_tex_pos;

// pseudo-random generator
const vec3 rand_constants = vec3(12.9898, 78.233, 4375.85453);
float rand(const vec2 co) {
    float t = dot(rand_constants.xy, co);
    return fract(sin(t) * (rand_constants.z + t));
}

// wind speed lookup; use manual bilinear filtering based on 4 adjacent pixels for smooth interpolation
vec2 lookup_wind(const vec2 uv) {
    // float x = uv.x;
    // float y = uv.y;
    // vec2 centerUv = vec2(center.x / res.x, 1.0 - center.y / res.y);
    vec2 centerUv = vec2((center.x + 180.0)/ 360.0, (center.y + 90.0) / 180.0);
    vec2 v = centerUv - vec2(0.5, 0.5);
    vec2 v_particle_pos = uv + v;
    if(v_particle_pos.x < centerUv.x && v_particle_pos.y < centerUv.y) {
        v_particle_pos.x = v_particle_pos.x + (centerUv.x - v_particle_pos.x) * (pow(2.0, level) -1.0) / pow(2.0, level);
        v_particle_pos.y = v_particle_pos.y + (centerUv.y - v_particle_pos.y) * (pow(2.0, level) -1.0) / pow(2.0, level);
    } else if(v_particle_pos.x < centerUv.x && v_particle_pos.y > centerUv.y) {
        v_particle_pos.x = v_particle_pos.x + (centerUv.x - v_particle_pos.x) * (pow(2.0, level) -1.0) / pow(2.0, level);
        v_particle_pos.y = v_particle_pos.y - (v_particle_pos.y - centerUv.y) * (pow(2.0, level) -1.0) / pow(2.0, level);
    } else if(v_particle_pos.x > centerUv.x && v_particle_pos.y < centerUv.y) {
        v_particle_pos.x = v_particle_pos.x - (v_particle_pos.x - centerUv.x) * (pow(2.0, level) -1.0) / pow(2.0, level);
        v_particle_pos.y = v_particle_pos.y + (centerUv.y - v_particle_pos.y) * (pow(2.0, level) -1.0) / pow(2.0, level);
    } else if(v_particle_pos.x > centerUv.x && v_particle_pos.y > centerUv.y) {
        v_particle_pos.x = v_particle_pos.x - (v_particle_pos.x - centerUv.x) * (pow(2.0, level) -1.0) / pow(2.0, level);
        v_particle_pos.y = v_particle_pos.y - (v_particle_pos.y - centerUv.y) * (pow(2.0, level) -1.0) / pow(2.0, level);
    }
    return texture2D(u_wind, v_particle_pos).rg; // lower-res hardware filtering
    // vec2 px = 1.0 / u_wind_res;
    // vec2 vc = (floor(uv * u_wind_res)) * px;
    // vec2 f = fract(uv * u_wind_res);
    // vec2 tl = texture2D(u_wind, vc).rg;
    // vec2 tr = texture2D(u_wind, vc + vec2(px.x, 0)).rg;
    // vec2 bl = texture2D(u_wind, vc + vec2(0, px.y)).rg;
    // vec2 br = texture2D(u_wind, vc + px).rg;
    // return mix(mix(tl, tr, f.x), mix(bl, br, f.x), f.y);
}

vec2 getNewUV(float x, float y) {
    vec2 centerUv = vec2(center.x / res.x, 1.0 - center.y / res.y);
    vec2 uv_new = vec2(0, 0);
    if(x < centerUv.x && y < centerUv.y) {
        uv_new.x = centerUv.x - 0.25;
        uv_new.y = centerUv.y - 0.25;
    } else if(x < centerUv.x && y > centerUv.y) {
        uv_new.x = centerUv.x - 0.25;
        uv_new.y = centerUv.y + 0.25;
    } else if(x > centerUv.x && y < centerUv.y) {
        uv_new.x = centerUv.x + 0.25;
        uv_new.y = centerUv.y - 0.25;
    } else if(x > centerUv.x && y > centerUv.y) {
        uv_new.x = centerUv.x + 0.25;
        uv_new.y = centerUv.y + 0.25;
    }
    return uv_new;
}

void main() {
    vec4 color = texture2D(u_particles, v_tex_pos);
    vec2 pos = vec2(
        color.r / 255.0 + color.b,
        color.g / 255.0 + color.a); // decode particle position from pixel RGBA
    vec2 velocity = mix(u_wind_min, u_wind_max, lookup_wind(pos));
    float speed_t = length(velocity) / length(u_wind_max);

    // take EPSG:4236 distortion into account for calculating where the particle moved
    float distortion = cos(radians(pos.y));
    vec2 offset = vec2(velocity.x / distortion, -velocity.y) * 0.0001 * u_speed_factor;

    // update particle position, wrapping around the date line
    pos = fract(1.0 + pos + offset);

    // a random seed to use for the particle drop
    vec2 seed = (pos + v_tex_pos) * u_rand_seed;

    // drop rate is a chance a particle will restart at random position, to avoid degeneration
    float drop_rate = u_drop_rate + speed_t * u_drop_rate_bump;
    float drop = step(1.0 - drop_rate, rand(seed));

    vec2 random_pos = vec2(
        rand(seed + 1.3),
        rand(seed + 2.1));
    pos = mix(pos, random_pos, drop);

    // encode the new particle position back into RGBA
    gl_FragColor = vec4(
        fract(pos * 255.0),
        floor(pos * 255.0) / 255.0);
}`;

export default updateFrag;
