import {
  FuzzyAND,
  FuzzyModule,
  FuzzyRule,
  FuzzyVariable,
  GameEntity,
  LeftShoulderFuzzySet,
  RightShoulderFuzzySet,
  TriangularFuzzySet,
} from "yuka";

import * as THREE from "three";

export class Monster extends GameEntity {
  constructor() {
    super();

    this.health = 5;
    this.player = null;
    this.aggressionState = null;

    this.fuzzyAggressionModule = new FuzzyModule();

    this.initFuzzyModule();
  }

  start() {
    this.player = this.manager.getEntityByName("player");
    console.log(this);
    return this;
  }

  update() {
    super.update();
    this.selectAggressionStance();

    console.log(this.health);
    return this;
  }

  selectAggressionStance() {
    const fuzzyAggressionModule = this.fuzzyAggressionModule;

    const currentHealth = this.health;
    const distanceToPlayer = this.position.distanceTo(this.player.position);

    fuzzyAggressionModule.fuzzify("distance", distanceToPlayer);
    fuzzyAggressionModule.fuzzify("health", currentHealth);

    const desirabilityValue = fuzzyAggressionModule.defuzzify("desirability");

    if (desirabilityValue < 33) {
      this.aggressionState = "defensive";
      this._renderComponent.material.color = new THREE.Color(0x27ae60); // GREEN
    } else if (desirabilityValue < 66) {
      this.aggressionState = "balanced";
      this._renderComponent.material.color = new THREE.Color(0xf1c40f); // YELLOW
    } else {
      this.aggressionState = "aggressive";
      this._renderComponent.material.color = new THREE.Color(0xe74c3c); // RED
    }

    return this;
  }

  initFuzzyModule() {
    const fuzzyAggressionModule = this.fuzzyAggressionModule;

    // Distance FLV
    const distance = new FuzzyVariable();

    const playerClose = new LeftShoulderFuzzySet(0, 3, 4);
    const playerMedium = new TriangularFuzzySet(3, 4, 7);
    const playerFar = new RightShoulderFuzzySet(7, 8, 12);

    const distanceFuzzySets = [playerClose, playerMedium, playerFar];

    distanceFuzzySets
        .forEach((playerDistance) =>
      distance.add(playerDistance),
    );

    fuzzyAggressionModule.addFLV("distance", distance);

    // Health FLV
    const health = new FuzzyVariable();

    const lowHealth = new LeftShoulderFuzzySet(0, 1, 2);
    const mediumHealth = new TriangularFuzzySet(2, 3, 4);
    const highHealth = new RightShoulderFuzzySet(3, 4, 5);

    health.add(lowHealth);
    health.add(mediumHealth);
    health.add(highHealth);

    fuzzyAggressionModule.addFLV("health", health);

    // Desirability FLV
    const desirability = new FuzzyVariable();
    const defensive = new LeftShoulderFuzzySet(0, 25, 50);
    const balanced = new TriangularFuzzySet(25, 50, 75);
    const aggressive = new RightShoulderFuzzySet(50, 75, 100);

    desirability.add(defensive);
    desirability.add(balanced);
    desirability.add(aggressive);

    fuzzyAggressionModule.addFLV("desirability", desirability);

    // Rule 1: If health is low AND enemy is close, desirability is defensive
    fuzzyAggressionModule.addRule(
      new FuzzyRule(new FuzzyAND(lowHealth, playerClose), defensive),
    );

    // Rule 2: If health is low AND enemy is medium, desirability is balanced
    fuzzyAggressionModule.addRule(
      new FuzzyRule(new FuzzyAND(lowHealth, playerMedium), balanced),
    );

    // Rule 3: If health is low AND enemy is far, desirability is aggressive
    fuzzyAggressionModule.addRule(
      new FuzzyRule(new FuzzyAND(lowHealth, playerFar), aggressive),
    );

    // Rule 4: If health is medium AND enemy is close, desirability is defensive
    fuzzyAggressionModule.addRule(
      new FuzzyRule(new FuzzyAND(mediumHealth, playerClose), defensive),
    );

    // Rule 5: If health is medium AND enemy is medium, desirability is balanced
    fuzzyAggressionModule.addRule(
      new FuzzyRule(new FuzzyAND(mediumHealth, playerMedium), balanced),
    );

    // Rule 6: If health is medium AND enemy is far, desirability is aggressive
    fuzzyAggressionModule.addRule(
      new FuzzyRule(new FuzzyAND(mediumHealth, playerFar), aggressive),
    );

    // Rule 7: If health is high AND enemy is close, desirability is aggressive
    fuzzyAggressionModule.addRule(
      new FuzzyRule(new FuzzyAND(highHealth, playerClose), aggressive),
    );

    // Rule 8: If health is high AND enemy is medium, desirability is balanced
    fuzzyAggressionModule.addRule(
      new FuzzyRule(new FuzzyAND(highHealth, playerMedium), balanced),
    );

    // Rule 9: If health is high AND enemy is far, desirability is defensive
    fuzzyAggressionModule.addRule(
      new FuzzyRule(new FuzzyAND(highHealth, playerFar), defensive),
    );
  }
}
