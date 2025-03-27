import { GameEntity, StateMachine } from "yuka";
import { HorizontalMovementState, VerticalMovementState } from "./states.util.js";

export class Cube extends GameEntity {
  constructor(mesh) {
    super();
    this.mesh = mesh;
    this.stateMachine = new StateMachine(this);

    this.stateMachine.add("HORIZONTAL", new HorizontalMovementState());
    this.stateMachine.add("VERTICAL", new VerticalMovementState());

    this.stateMachine.changeTo("HORIZONTAL");

    this.currentTime = 0; // tracks how long the entity is in the current state
    this.stateDuration = 5; // duration of a single state in seconds
  }

  update(delta) {
    this.currentTime += delta;
    this.stateMachine.update();
    return this;
  }
}
