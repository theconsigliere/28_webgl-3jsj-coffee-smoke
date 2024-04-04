uniform sampler2D uPerlinTexture;
uniform float uSmokeWidth;
uniform float uTime;

varying vec2 vUv;

void main() {

    //scale and animate
    vec2 smokeUv = vUv;
    // stretch perlin texture
    smokeUv.x *= uSmokeWidth;
    smokeUv.y *= 0.3;
    // animate texture upwards
    smokeUv.y -= uTime * 0.03;

    // smoke
   // since perlin is grayscale, we can just use the red channel
    float smoke = texture2D(uPerlinTexture, smokeUv).r;

    // remap the smoke to be more transparent and more opaque in areas of more smoke
    smoke = smoothstep(0.4, 1.0, smoke);

    // gradient hide edges
   // first 10% and last 10% of the plane
    float edgeX = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
     // first 10% and last 40% of the plane
    float edgeY = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.4, vUv.y);

    // multiply smoke by edge
    smoke *= edgeX * edgeY;


    // final colour
    gl_FragColor = vec4(0.6, 0.3, 0.2, smoke);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}