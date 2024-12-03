import {
  AbstractMesh,
  Color3,
  Material,
  Mesh,
  PBRBaseMaterial,
  StandardMaterial,
  RecastJSPlugin,
  Scene,
  Vector3,
} from "@babylonjs/core";
import AntObject from "./AntObject";
import PlayerAnt from "./PlayerAnt";
import { UIManager } from "../Features/UIManager";

export default class EnemyAnt extends AntObject {

  private playerAnt: PlayerAnt;
  private isColliding: boolean = false;

  constructor(
    startPosition: Vector3,
    scene: Scene,
    navigationPlugin: RecastJSPlugin,
    crowd,
    assignedPlayerAnt: PlayerAnt
  ) {
    super(startPosition, scene, navigationPlugin, crowd);
    this.playerAnt = assignedPlayerAnt;
    this.ready.then(() => {
      this.initializeEnemyAnt(scene, this.playerAnt);
    });
  }

  private initializeEnemyAnt(scene: Scene, playerAnt: PlayerAnt) {
    this.randomMove();
    this.addEnemyBehaviour(scene, this.getMesh(), this.playerAnt.getMesh());
  }

  private addEnemyBehaviour(
    scene: Scene,
    enemyMesh: AbstractMesh,
    playerMesh: AbstractMesh
  ) {

    const enemyMaterial = new StandardMaterial("enemyMaterial", scene);
    enemyMaterial.diffuseColor = new Color3(1, 0, 0); // Rotes Material für Enemy Ant

    scene.registerBeforeRender(() => {
      if (playerMesh.intersectsMesh(enemyMesh, false)) {
        if (!this.isColliding) {
          // Beginn der Kollision
          this.isColliding = true;
          this.changeMaterial(enemyMaterial);
          this.playerAnt.setHealth(this.playerAnt.getHealth() - 20);
          UIManager.getInstance().healthBar.value = this.playerAnt.getHealth();
        }
      } else {
        if (this.isColliding) {
          // Ende der Kollision
          this.isColliding = false;
        }
      }
    });
  }
}
