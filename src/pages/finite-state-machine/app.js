// Setup
import * as THREE from "three";
import * as YUKA from "yuka";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {Cube} from "./utils/cube.util.js";

const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const entityManager = new YUKA.EntityManager();
const time = new YUKA.Time();

// [Window Resize]
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
scene.add(camera);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1),
    new THREE.MeshBasicMaterial({ color: 0xffabac, wireframe: true }),
);
scene.add(mesh);
const cube = new Cube(mesh);
entityManager.add(cube);

const tick = () => {
  const delta = time.update().getDelta();
  entityManager.update(delta);
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
