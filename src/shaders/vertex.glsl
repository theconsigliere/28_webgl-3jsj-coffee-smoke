uniform sampler2D uPerlinTexture;
uniform float uTime;

varying vec2 vUv;

#include ./includes/rotate2D.glsl

void main() {
    vUv = uv;

    vec3 newPosition = position;

    float modifyY = 0.2 - uTime * 0.005;
    // get middle of the texture and get the value of y of the perlin noise, return .r because it's a grayscale texture
    float twistPerlin = texture2D(uPerlinTexture, vec2(0.5, vUv.y * modifyY)).r;

    // rotate the vertex on xz depending on y to get a twist effect
   // float angle = newPosition.y;
    float angle = twistPerlin * 10.0;
    newPosition.xz = rotate2D(newPosition.xz, angle);

    //wind
    // get offsset from first 25% of Xaxis perlin noise 
    vec2 windOffset = vec2(
        // movement on x axis
     texture2D(uPerlinTexture, vec2(0.25, uTime * 0.01)).r -0.5, 
    // movement on z axis
     texture2D(uPerlinTexture, vec2(0.75, uTime * 0.01)).r -0.5
     );

    // mutliply the top of the plane (1.0) more and bottom of the plane less 
    windOffset *= pow(vUv.y, 2.0) * 10.0;
    newPosition.xz += windOffset;


    // final
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}