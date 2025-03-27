import * as THREE from "three";
import * as YUKA from "yuka";
import * as DAT from "dat.gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Monster } from "./utils/Monster.js";

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
  1000,
);
camera.position.set(1, 1, 2);
scene.add(camera);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const grid = new THREE.GridHelper(100, 50);
scene.add(grid);

// [Logic Goes Here]
// [PLAYER]
const playerGeometry = new THREE.SphereGeometry(1);
const playerMaterial = new THREE.MeshBasicMaterial({
  color: 0x0984e3,
  wireframe: true,
});
const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
playerMesh.matrixAutoUpdate = false;
scene.add(playerMesh);
const playerEntity = new YUKA.Vehicle();
playerEntity.setRenderComponent(playerMesh, sync);

// Player Path
const path = new YUKA.Path();
path.loop = true;
path.add(new YUKA.Vector3(-8, 0, 8));
path.add(new YUKA.Vector3(-6, 0, 0));
path.add(new YUKA.Vector3(-4, 0, -4));
path.add(new YUKA.Vector3(-2, 0, -2));
path.add(new YUKA.Vector3(8, 0, -8));
path.add(new YUKA.Vector3(6, 0, 0));
path.add(new YUKA.Vector3(4, 0, 4));
path.add(new YUKA.Vector3(0, 0, 6));

playerEntity.position.copy(path.current());
const followPathBehavior = new YUKA.FollowPathBehavior(path, 0.5);
playerEntity.steering.add(followPathBehavior);
const onPathBehavior = new YUKA.OnPathBehavior(path);
playerEntity.steering.add(onPathBehavior);

playerEntity.name = "player";

entityManager.add(playerEntity);

// [MONSTER]
const monsterGeometry = new THREE.SphereGeometry(1);
const monsterMaterial = new THREE.MeshBasicMaterial({
  color: 0xd63031,
  wireframe: true,
});
const monsterMesh = new THREE.Mesh(monsterGeometry, monsterMaterial);
monsterMesh.matrixAutoUpdate = false;
scene.add(monsterMesh);
const monsterEntity = new Monster();
monsterEntity.setRenderComponent(monsterMesh, sync);

entityManager.add(playerEntity);
entityManager.add(monsterEntity);
// [Logic Ends Here]

const tick = () => {
  window.requestAnimationFrame(tick);

  const delta = time.update().getDelta();
  entityManager.update(delta);
  controls.update();
  renderer.render(scene, camera);
};

function sync(entity, renderComponent) {
  renderComponent.matrix.copy(entity.worldMatrix);
}

function initGUI() {
  const gui = new DAT.GUI({ width: 400 });

  gui
    .add(monsterEntity, "health", 0, 5, 1)
    .name("Monster Health")
    .onChange((value) => {
      monsterEntity.health = value;
    });
}

initGUI();
tick();
