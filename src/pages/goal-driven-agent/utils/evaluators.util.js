import { RestGoal, GatherGoal, DeliverGoldToBaseGoal } from "./goals.util.js";
import { GoalEvaluator } from "yuka";

export class RestEvaluator extends GoalEvaluator {
  calculateDesirability(miner) {
    return miner.tired() ? 1 : 0;
  }

  setGoal(miner) {
    const currentSubgoal = miner.brain.currentSubgoal();

    if (!(currentSubgoal instanceof RestGoal)) {
      miner.brain.clearSubgoals();

      miner.brain.addSubgoal(new RestGoal(miner));
    }
  }
}

export class GatherEvaluator extends GoalEvaluator {
  calculateDesirability(miner) {
    if (miner.currentGold < miner.MAX_GOLD) {
      return 0.6;
    }
    return 0.4;
  }

  setGoal(miner) {
    const currentSubgoal = miner.brain.currentSubgoal();

    if (!(currentSubgoal instanceof GatherGoal)) {
      miner.brain.clearSubgoals();
      miner.brain.addSubgoal(new GatherGoal(miner));
    }
  }
}

export class DeliveryEvaluator extends GoalEvaluator {
  calculateDesirability(miner) {
    if (miner.currentGold >= miner.MAX_GOLD) {
      return 0.6;
    }
    return 0.4;
  }

  setGoal(miner) {
    const currentSubgoal = miner.brain.currentSubgoal();

    if (!(currentSubgoal instanceof DeliverGoldToBaseGoal)) {
      miner.brain.clearSubgoals();
      miner.brain.addSubgoal(new DeliverGoldToBaseGoal(miner));
    }
  }
}
