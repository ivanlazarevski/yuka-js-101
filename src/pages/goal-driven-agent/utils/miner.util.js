import { Vehicle, Think, ArriveBehavior } from "yuka";
import {DeliveryEvaluator, GatherEvaluator, RestEvaluator} from "./evaluators.util.js";

export class Miner extends Vehicle {
  constructor() {
    super();

    this.maxTurnRate = Math.PI * 0.5;
    this.maxSpeed = 1.5;

    this.brain = new Think(this);

    this.brain.addEvaluator(new RestEvaluator());
    this.brain.addEvaluator(new GatherEvaluator());
    this.brain.addEvaluator(new DeliveryEvaluator());

    const arriveBehavior = new ArriveBehavior();
    arriveBehavior.deceleration = 1.5;
    this.steering.add(arriveBehavior);

    this.currentGold = 0;
    this.fatigueLevel = 0;
    this.MAX_FATIGUE = 3;
    this.MAX_GOLD = 2;
    this.currentTime = 0; // tracks the current time of an action
    this.deltaTime = 0; // the current time delta value
  }

  update(delta) {
    super.update(delta);
    this.deltaTime = delta;
    this.brain.execute();
    this.brain.arbitrate();
    return this;
  }

  tired() {
    return this.fatigueLevel >= this.MAX_FATIGUE;
  }
}
