import { Goal, CompositeGoal, Vector3 } from "yuka";

export class RestGoal extends Goal {
  constructor(owner) {
    super(owner);
  }

  activate() {
  }

  execute() {
    const owner = this.owner;
    owner.currentTime += owner.deltaTime;
    if (owner.currentTime >= owner.restDuration) {
      this.status = Goal.STATUS.COMPLETED;
    }
  }
  terminate() {
    const owner = this.owner;
    owner.currentTime = 0;
    owner.fatigueLevel = 0;
  }
}

export class GatherGoal extends CompositeGoal {
  constructor(owner) {
    super(owner);
  }

  activate() {
    this.clearSubgoals();
    const owner = this.owner;

    this.addSubgoal(new FindNextGoldVeinGoal(owner));
    this.addSubgoal(new SeekToGoldVeinGoal(owner));
    this.addSubgoal(new MineGoldVeinGoal(owner));
  }
  execute() {
    this.status = this.executeSubgoals();
    this.replanIfFailed();
  }
  terminate() {
  }
}

class FindNextGoldVeinGoal extends Goal {
  constructor(owner) {
    super(owner);
  }

  activate() {
    const owner = this.owner;
    const entities = owner.manager.entities;
    let minDistance = Infinity;

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (entity !== owner) {
        const squaredDistance = owner.position.squaredDistanceTo(
          entity.position,
        );

        if (squaredDistance < minDistance && entity.goldAmount > 0) {
          minDistance = squaredDistance;
          owner.currentTarget = entity;
        }
      }
    }
  }

  execute() {
    const owner = this.owner;
    if (owner.currentTarget !== null) {
      this.status = Goal.STATUS.COMPLETED;
    } else {
      this.status = Goal.STATUS.FAILED;
    }
  }

  terminate() {
    // console.log("Miner has found the next gold vein!");
  }
}

class SeekToGoldVeinGoal extends Goal {
  constructor(owner) {
    super(owner);
  }

  activate() {
    const owner = this.owner;

    if (owner.currentTarget !== null) {
      const arriveBehavior = owner.steering.behaviors[0];
      arriveBehavior.target = owner.currentTarget.position;
      arriveBehavior.active = true;
    } else {
      this.status = Goal.STATUS.FAILED;
    }
  }

  execute() {
    if (this.active()) {
      const owner = this.owner;
      const squaredDistance = owner.position.squaredDistanceTo(
        owner.currentTarget.position,
      );

      if (squaredDistance < 0.25) {
        this.status = Goal.STATUS.COMPLETED;
      }
    }
  }

  terminate() {
    const arriveBehavior = this.owner.steering.behaviors[0];
    arriveBehavior.active = false;
    this.owner.velocity.set(0, 0, 0);
  }
}

class MineGoldVeinGoal extends Goal {
  constructor(owner) {
    super(owner);
  }

  activate() {}
  execute() {
    const owner = this.owner;
    owner.currentTime += owner.deltaTime;
    console.log(owner.currentGold, owner.MAX_GOLD);
    if (owner.currentGold < owner.MAX_GOLD) {
      owner.sendMessage(owner.currentTarget, "mine");
      owner.currentGold++;
    } else {
      owner.currentTarget = null;
      this.status = Goal.STATUS.COMPLETED;
    }
  }
  terminate() {
    const owner = this.owner;
    owner.currentTime = 0;
    owner.fatigueLevel++;
  }
}

export class DeliverGoldToBaseGoal extends Goal {
  constructor(owner) {
    super(owner);
  }

  activate() {
    const owner = this.owner;
    const arriveBehavior = owner.steering.behaviors[0];
    arriveBehavior.target = new Vector3(0, 0, 0);
    arriveBehavior.active = true;
  }

  execute() {
    if (this.active()) {
      const owner = this.owner;

      const squaredDistance = owner.position.squaredDistanceTo(
        new Vector3(0, 0, 0),
      );

      if (squaredDistance < 0.25) {
        owner.currentGold = 0;
        this.status = Goal.STATUS.COMPLETED;
      }
    }
  }

  terminate() {
    // console.log('Delivered to base.');
  }
}
