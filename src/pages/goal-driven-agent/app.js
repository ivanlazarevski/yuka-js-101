import * as THREE from "three";
import * as YUKA from "yuka";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Miner } from "./utils/miner.util.js";
import { GoldVein } from "./utils/gold-vein.util.js";

const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const entityManager = new YUKA.EntityManager();
const time = new YUKA.Time();

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

// [Miner]
const geometry = new THREE.SphereGeometry(0.2, 16, 16);
const material = new THREE.MeshBasicMaterial({
  color: "#0984e3",
  wireframe: true,
});
const minerMesh = new THREE.Mesh(geometry, material);
const miner = new Miner(minerMesh);
minerMesh.matrixAutoUpdate = false;
miner.setRenderComponent(minerMesh, sync);
scene.add(minerMesh);
entityManager.add(miner);

const baseGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const baseMaterial = new THREE.MeshBasicMaterial({
  color: "#27ae60",
  wireframe: true,
});
const base = new THREE.Mesh(baseGeometry, baseMaterial);
scene.add(base);

// [Gold Veins]
const goldVeinGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const goldVeinMaterial = new THREE.MeshBasicMaterial({ color: "#fce300" });

for (let i = 0; i < 5; i++) {
  const goldVeinMesh = new THREE.Mesh(goldVeinGeometry, goldVeinMaterial);
  goldVeinMesh.matrixAutoUpdate = false;
  goldVeinMesh.castShadow = true;

  const goldVein = new GoldVein(goldVeinMesh);
  goldVein.setRenderComponent(goldVeinMesh, sync);
  goldVein.spawn();

  scene.add(goldVeinMesh);
  entityManager.add(goldVein);
}

const tick = () => {
  const delta = time.update().getDelta();
  entityManager.update(delta);
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

function sync(entity, renderComponent) {
  renderComponent.matrix.copy(entity.worldMatrix);
}

tick();
