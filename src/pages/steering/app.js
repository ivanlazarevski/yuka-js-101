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

camera.position.set(1,1,2);
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


// [Arrive Behavior]
const vehicleMesh = new THREE.Mesh(
  new THREE.ConeGeometry(0.1, 0.5, 8),
  new THREE.MeshBasicMaterial({ color: 0xffcc00 }),
);
vehicleMesh.geometry.rotateX(Math.PI * 0.5);
vehicleMesh.matrixAutoUpdate = false;
scene.add(vehicleMesh);

const arriveVehicle = new YUKA.Vehicle();
arriveVehicle.setRenderComponent(vehicleMesh, sync);
const arriveBehavior = new YUKA.ArriveBehavior(new YUKA.Vector3(0, 0, 0), 3, 0);
// Target: The arrival location, expressed as a YUKA Vector3
// Deceleration: Determines how quickly the entity slows down when approaching the target.
// Tolerance: Defines how close the entity needs to get to the target before it considers itself "arrived" and stops moving.

arriveVehicle.steering.add(arriveBehavior);
arriveVehicle.maxSpeed = 100;
entityManager.add(arriveVehicle);

// [Follow Path Behavior]
const followGeometry = new THREE.ConeGeometry(0.1, 0.5, 8);
const followMesh = new THREE.Mesh(
  followGeometry,
  new THREE.MeshBasicMaterial({ color: 0x8e44ad }),
);

followMesh.geometry.rotateX(Math.PI * 0.5);
followMesh.matrixAutoUpdate = false;

followMesh.position.set(0.5, 0, 0.5);
followMesh.updateMatrix();
scene.add(followMesh);

const followVehicle = new YUKA.Vehicle();
followVehicle.setRenderComponent(followMesh, sync);

const path = new YUKA.Path();
path.loop = true;
path.add(new YUKA.Vector3(-2, 0, 2));
path.add(new YUKA.Vector3(-4, 0, 0));
path.add(new YUKA.Vector3(-2, 0, -2));
path.add(new YUKA.Vector3(0, 0, 0));
path.add(new YUKA.Vector3(2, 0, -2));
path.add(new YUKA.Vector3(4, 0, 0));
path.add(new YUKA.Vector3(2, 0, 2));
path.add(new YUKA.Vector3(0, 0, 4));

// Setting the vehicle on the starting point
followVehicle.position.copy(path.current());

const followPathBehavior = new YUKA.FollowPathBehavior(path, 0.5);
// nextWaypointDistance: The distance the agent seeks for the next waypoint.
followVehicle.steering.add(followPathBehavior);

const onPathBehavior = new YUKA.OnPathBehavior(path);
// radius: With a smaller radius, the vehicle will have to follow the path more closely.
// predictionFactor – Determines how far the behavior predicts the movement of the vehicle.chat
followVehicle.steering.add(onPathBehavior);

entityManager.add(followVehicle);

// [Flocking Behavior]
const flockingGeometry = new THREE.ConeGeometry(0.1, 0.5, 8);
flockingGeometry.rotateX(Math.PI * 0.5);
const flockingMaterial = new THREE.MeshBasicMaterial({ color: 0x6ab04c });

const alignmentBehavior = new YUKA.AlignmentBehavior(); // Alignment – Steer towards the average heading of nearby entities. Each entity adjusts its velocity to match the general movement direction of its neighbors.
const cohesionBehavior = new YUKA.CohesionBehavior(); // Cohesion – Move toward the center of the local group. Each entity steers toward the average position of nearby entities, ensuring they stay together.
const separationBehavior = new YUKA.SeparationBehavior(); // Separation – Avoid crowding neighbors. Each entity steers away from nearby entities to prevent collisions.

alignmentBehavior.weight = 1.5;
cohesionBehavior.weight = 1.5;
separationBehavior.weight = 0.3;

for (let i = 0; i < 10; i++) {
  const flockingMesh = new THREE.Mesh(flockingGeometry, flockingMaterial);
  flockingMesh.matrixAutoUpdate = false;
  scene.add(flockingMesh);

  const flockingVehicle = new YUKA.Vehicle();
  flockingVehicle.maxSpeed = 1;
  flockingVehicle.updateNeighborhood = true;
  flockingVehicle.neighborhoodRadius = 10;
  flockingVehicle.rotation.fromEuler(0, Math.PI * Math.random(), 0);
  flockingVehicle.rotation.fromEuler(0, Math.PI * Math.random(), 0);
  flockingVehicle.position.x = 10 - Math.random() * 20;
  flockingVehicle.position.z = 10 - Math.random() * 20;

  flockingVehicle.setRenderComponent(flockingMesh, sync);

  flockingVehicle.steering.add(alignmentBehavior);
  flockingVehicle.steering.add(cohesionBehavior);
  flockingVehicle.steering.add(separationBehavior);

  const wanderBehavior = new YUKA.WanderBehavior();
  wanderBehavior.weight = 0.5;
  flockingVehicle.steering.add(wanderBehavior);

  entityManager.add(flockingVehicle);
}
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

tick();
