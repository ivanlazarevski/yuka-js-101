import { GameEntity } from "yuka";
import * as THREE from 'three';

export class GoldVein extends GameEntity {
  constructor(mesh) {
    super();
    this.mesh = mesh;
    console.log(mesh);
  }
  spawn() {
    this.goldAmount = 3;

    this.position.x = Math.random() * 15 - 7;
    this.position.z = Math.random() * 15 - 7;

    if (this.position.x < 1 && this.position.x > -1) {
      this.position.x += 1;
    }

    if (this.position.z < 1 && this.position.y > -1) {
      this.position.z += 1;
    }
  }
  handleMessage(telegram) {
    const message = telegram.message;
    if (this.goldAmount > 0) {
      this.goldAmount -= 1;
    }

    if(this.goldAmount <= 0) {
      this.mesh.material = new THREE.MeshBasicMaterial({color: '#c0392b'});
    }
  }
}
