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
uniform vec4 extent;
varying vec2 v_tex_pos;

// pseudo-random generator
const vec3 rand_constants = vec3(12.9898, 78.233, 4375.85453);
float rand(const vec2 co) {
    float t = dot(rand_constants.xy, co);
    return fract(sin(t) * (rand_constants.z + t));
}

// wind speed lookup; use manual bilinear filtering based on 4 adjacent pixels for smooth interpolation
vec2 lookup_wind(const vec2 uv) {
    float xmin = (extent.x + 180.0) / 360.0;
    float ymin = (extent.z + 90.0) / 180.0;
    float xmax = (extent.y + 180.0) / 360.0;
    float ymax = (extent.w + 90.0) / 180.0;
    float xWidth = xmax - xmin;
    float yHeight = ymax - ymin;
    vec2 centerUv = vec2(0.5, 0.5);
    //v_particle_pos = vec2(v_particle_pos.x, 1.0 - v_particle_pos.y);
    vec2 v_particle_pos = uv;
    //三象限
    if(v_particle_pos.x < centerUv.x && v_particle_pos.y < centerUv.y) {
        v_particle_pos.x = v_particle_pos.x * xWidth + xmin;
        v_particle_pos.y = v_particle_pos.y * yHeight + ymin;
    } else if(v_particle_pos.x < centerUv.x && v_particle_pos.y > centerUv.y) {//二象限
        v_particle_pos.x = v_particle_pos.x * xWidth + xmin;
        v_particle_pos.y = (v_particle_pos.y - 1.0) * yHeight + ymax ;
    } else if(v_particle_pos.x > centerUv.x && v_particle_pos.y < centerUv.y) {//四象限
        v_particle_pos.x = (v_particle_pos.x -  1.0) * xWidth + xmax;
        v_particle_pos.y = v_particle_pos.y * yHeight + ymin;
    } else if(v_particle_pos.x > centerUv.x && v_particle_pos.y > centerUv.y) {//一象限
        v_particle_pos.x = (v_particle_pos.x -  1.0) * xWidth + xmax;
        v_particle_pos.y = (v_particle_pos.y -  1.0) * yHeight + ymax;
    }
    // return texture2D(u_wind, v_particle_pos).rg; // lower-res hardware filtering
    vec2 px = 1.0 / u_wind_res;
    vec2 vc = (floor(v_particle_pos * u_wind_res)) * px;
    vec2 f = fract(v_particle_pos * u_wind_res);
    vec2 tl = texture2D(u_wind, vc).rg;
    vec2 tr = texture2D(u_wind, vc + vec2(px.x, 0)).rg;
    vec2 bl = texture2D(u_wind, vc + vec2(0, px.y)).rg;
    vec2 br = texture2D(u_wind, vc + px).rg;
    return mix(mix(tl, tr, f.x), mix(bl, br, f.x), f.y);
}

void main() {
    vec4 color = texture2D(u_particles, v_tex_pos);
    vec2 pos = vec2(
        color.r / 255.0 + color.b,
        color.g / 255.0 + color.a); // decode particle position from pixel RGBA
    //pos = vec2(pos.x, 1.0 - pos.y);
    vec2 velocity = mix(u_wind_min, u_wind_max, lookup_wind(pos));
    float speed_t = length(velocity) / length(u_wind_max);

    // take EPSG:4236 distortion into account for calculating where the particle moved
    float distortion = cos(radians(pos.y * 180.0 - 90.0));
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
