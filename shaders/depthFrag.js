const depth_frag = `
#ifdef GL_ES
    precision mediump float;
    #endif
    vec4 pack (float depth) {
        // 当光源与照射物间距离变远,z值会增大,而1个分量的8位已经不够存储深度值,所以扩充使用4个分量共32位进行存储
        // 使用rgba 4字节共32位来存储z值,1个字节精度为1/256
        const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
        const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);
        // gl_FragCoord:片元的坐标,fract():返回数值的小数部分
        vec4 rgbaDepth = fract(depth * bitShift); //计算每个点的z值 
        rgbaDepth -= rgbaDepth.rrgb * bitMask; // Cut off the value which do not fit in 8 bits
        return rgbaDepth;
    }
    float near = 1.0;
    float far  = 100.0;

    float LinearizeDepth(float depth)
    {
        float z = depth * 2.0 - 1.0; // back to NDC 
        return (2.0 * near * far) / (far + near - z * (far - near));    
    }
    void main() {
        float depth = LinearizeDepth(gl_FragCoord.z) / far;
        //gl_FragColor = pack(depth);
        gl_FragColor = vec4(vec3(depth), 1.0);
    }
`;
export default depth_frag;
