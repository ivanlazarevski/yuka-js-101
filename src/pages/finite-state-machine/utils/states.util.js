import { State } from "yuka";

const VERTICAL = "VERTICAL";
const HORIZONTAL = "HORIZONTAL";

export class HorizontalMovementState extends State {
  enter(cube) {
    console.log("Cube started moving horizontally...");
  }
  execute(cube) {
    cube.mesh.rotation.x += Math.sin(cube.currentTime) * 0.05;
    cube.mesh.rotation.z += Math.sin(cube.currentTime) * 0.01;
    if (cube.currentTime >= cube.stateDuration) {
      cube.currentTime = 0;
      cube.stateMachine.changeTo(VERTICAL);
    }
  }
  exit(cube) {
    console.log("Cube stopped moving horizontally...");
  }
}

export class VerticalMovementState extends State {
  enter(cube) {
    console.log("Cube started moving vertically...");
  }

  execute(cube) {
    cube.mesh.rotation.y += Math.cos(cube.currentTime) * 0.05;
    cube.mesh.rotation.z -= Math.sin(cube.currentTime) * 0.01;
    if (cube.currentTime >= cube.stateDuration) {
      cube.currentTime = 0;
      cube.stateMachine.changeTo(HORIZONTAL);
    }
  }

  exit(cube) {
    console.log("Cube stopped moving vertically...");
  }
}
