import {
  AbstractMesh,
  Color3,
  Mesh,
  StandardMaterial,
  RecastJSPlugin,
  Scene,
  Vector3,
} from "@babylonjs/core";
import AntObject from "./AntObject";
import PlayerAnt from "./PlayerAnt";
import { UIManager } from "../Features/UIManager";

export default class FriendAnt extends AntObject {
  private playerAnt: PlayerAnt;
  private wasColliding: boolean = false;

  constructor(
    startPosition: Vector3,
    scene: Scene,
    navigationPlugin: RecastJSPlugin,
    crowd,
    playerAnt: PlayerAnt
  ) {
    super(startPosition, scene, navigationPlugin, crowd);
    this.playerAnt = playerAnt;
    this.ready.then(() => {
      this.initializeFriendAnt(scene, playerAnt);
    });
  }

  private initializeFriendAnt(scene: Scene, playerAnt: PlayerAnt) {
    this.randomMove();
    this.addFriendBehaviour(scene, this.getMesh(), playerAnt.getMesh());
  }

  private addFriendBehaviour(
    scene: Scene,
    friendMesh: AbstractMesh,
    playerMesh: AbstractMesh
  ) {
    const friendMaterial = new StandardMaterial("friendMaterial");
    friendMaterial.diffuseColor = new Color3(0, 1, 0);
    scene.registerBeforeRender(() => {
      if (playerMesh.intersectsMesh(friendMesh, false)) {
        if (!this.wasColliding) {
          // Beginn der Kollision
          this.wasColliding = true;
          this.changeMaterial(friendMaterial);
          this.playerAnt.setHealth(this.playerAnt.getHealth() + 20);
          UIManager.getInstance().healthBar.value = this.playerAnt.getHealth();
        }
      }
    });
  }
}
