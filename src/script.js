import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import GUI from "lil-gui"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"

import fragment from "./shaders/fragment.glsl"
import vertex from "./shaders/vertex.glsl"

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  25,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.x = 8
camera.position.y = 10
camera.position.z = 12
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Model
 */
gltfLoader.load("./bakedModel.glb", (gltf) => {
  gltf.scene.getObjectByName("baked").material.map.anisotropy = 8
  scene.add(gltf.scene)
})

// SMOKE
const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64)
smokeGeometry.translate(0, 0.5, 0)
smokeGeometry.scale(1.5, 6, 1.5)

const perlinTexture = textureLoader.load("./perlin.png")
// repeat texture so we can animate
perlinTexture.wrapS = THREE.RepeatWrapping
perlinTexture.wrapT = THREE.RepeatWrapping

const smokeMaterial = new THREE.ShaderMaterial({
  // wireframe: true,
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uPerlinTexture: new THREE.Uniform(perlinTexture),
    uSmokeWidth: new THREE.Uniform(0.5),
  },
  transparent: true,
  depthWrite: false,
  side: THREE.DoubleSide,
})

const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial)
// bottom of plane is at top of mug
smoke.position.y = 1.83
scene.add(smoke)

// GUI
gui
  .add(smokeMaterial.uniforms.uSmokeWidth, "value")
  .min(0.1)
  .max(1)
  .step(0.01)
  .name("Smoke Width")

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update material
  smokeMaterial.uniforms.uTime.value = elapsedTime

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
