const testFrag = `
precision mediump float;
struct Color {
    vec3 value;
};
uniform Color color;

void main() {
    gl_FragColor = vec4(color.value, 1.0);
}`;

export default testFrag;
