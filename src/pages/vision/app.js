import * as THREE from "three";
import * as YUKA from "yuka";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

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

// [Watcher Mesh]
const watcherGeometry = new THREE.ConeGeometry(0.1, 0.5, 8);
watcherGeometry.rotateX(Math.PI * 0.5);
const watcherMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
const watcherMesh = new THREE.Mesh(watcherGeometry, watcherMaterial);
watcherMesh.matrixAutoUpdate = false;
scene.add(watcherMesh);

// [Watcher Entity]
const watcherEntity = new YUKA.Vehicle();
watcherEntity.setRenderComponent(watcherMesh, sync);

// [Watcher Vision]
// [Vision]
const watcherVision = new YUKA.Vision(watcherEntity);
watcherVision.range = 5;
watcherVision.fieldOfView = Math.PI * 0.5;
watcherEntity.vision = watcherVision;

// [Target Mesh]
const targetGeometry = new THREE.SphereGeometry(0.5);
const targetMaterial = new THREE.MeshBasicMaterial({
  color: 0x0984e3,
  wireframe: true,
});
const targetMesh = new THREE.Mesh(targetGeometry, targetMaterial);
targetMesh.matrixAutoUpdate = false;
scene.add(targetMesh);

// [Target Entity]
const targetEntity = new YUKA.Vehicle();
targetEntity.setRenderComponent(targetMesh, sync);

const arriveBehavior = new YUKA.ArriveBehavior(new YUKA.Vector3(0, 0, 0), 1, 0);
targetEntity.steering.add(arriveBehavior);
targetEntity.maxSpeed = 500;

// [Vision Helper]
const helper = createFOVHelper(watcherVision);
watcherMesh.add(helper);

// [Path Movement]
const path = new YUKA.Path();
path.loop = true;

path.add(new YUKA.Vector3(-2, 0, 2));
path.add(new YUKA.Vector3(2, 0, 2));
path.add(new YUKA.Vector3(2, 0, -2));
path.add(new YUKA.Vector3(-2, 0, -2));

watcherEntity.position.copy(path.current());
const followPathBehavior = new YUKA.FollowPathBehavior(path, 0.5);
watcherEntity.steering.add(followPathBehavior);
const onPathBehavior = new YUKA.OnPathBehavior(path);
watcherEntity.steering.add(onPathBehavior);

entityManager.add(watcherEntity);
entityManager.add(targetEntity);
// [Logic Ends Here]

const tick = () => {
  window.requestAnimationFrame(tick);

  const delta = time.update().getDelta();

  if (watcherEntity.vision.visible(targetEntity.position)) {
    targetMaterial.color.set(0xd63031);

  } else {
    targetMaterial.color.set(0x0984e3);
  }

  entityManager.update(delta);
  controls.update();
  renderer.render(scene, camera);
};

function sync(entity, renderComponent) {
  renderComponent.matrix.copy(entity.worldMatrix);
}

tick();

function createFOVHelper(vision, divisions = 8) {
  const fieldOfView = vision.fieldOfView;
  const range = vision.range;

  const geometry = new THREE.BufferGeometry();
  const material = new THREE.MeshBasicMaterial({ wireframe: true });
  const mesh = new THREE.Mesh(geometry, material);

  const positions = [];
  const fovHalf = fieldOfView / 2;
  const step = fieldOfView / divisions;

  for (let i = -fovHalf; i < fovHalf; i += step) {
    positions.push(0, 0, 0);
    positions.push(Math.sin(i) * range, 0, Math.cos(i) * range);
    positions.push(Math.sin(i + step) * range, 0, Math.cos(i + step) * range);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );

  return mesh;
}

window.addEventListener("click", (event) => {
  const mousePosition = getMousePosition(event);
  arriveBehavior.target.copy(mousePosition);
});

function getMousePosition(event) {
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const targetPosition = new THREE.Vector3();

  raycaster.ray.intersectPlane(groundPlane, targetPosition);
  return targetPosition;
}
