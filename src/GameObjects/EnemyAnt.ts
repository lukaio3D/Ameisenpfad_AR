import { AbstractMesh, Color3, Mesh, RecastJSPlugin, Scene, Vector3 } from "@babylonjs/core";
import AntObject from "./AntObject";
import PlayerAnt from "./PlayerAnt";

export default class EnemyBox extends AntObject {
  constructor(
    startPosition: Vector3,
    scene: Scene,
    navigationPlugin: RecastJSPlugin,
    crowd,
    playerAnt: PlayerAnt
  ) {
    super(startPosition, scene, navigationPlugin, crowd);
    this.ready.then(() => {
      this.initializeEnemyAnt(scene, playerAnt);
    });
    
  }

  private initializeEnemyAnt(scene: Scene, playerAnt: PlayerAnt) {
    this.randomMove();
    this.addEnemyBehaviour(scene, this.getMesh(), playerAnt.getMesh());
  }

  private addEnemyBehaviour(scene: Scene, enemyMesh: AbstractMesh, playerMesh: AbstractMesh) {
    scene.registerBeforeRender(() => {
      if (playerMesh.intersectsMesh(enemyMesh, false)) {
        console.log("Enemy hit player");
        this.changeColor(new Color3(1, 0, 0));
      } else {
        this.changeColor(new Color3(1, 1, 1));
        console.log("Enemy dont hit player");
      }
    });
  }
}