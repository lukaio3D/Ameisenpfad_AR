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

export default class EnemyAnt extends AntObject {
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

  private addEnemyBehaviour(
    scene: Scene,
    enemyMesh: AbstractMesh,
    playerMesh: AbstractMesh
  ) {
    const antMaterial = this.getMaterial();
    const enemyMaterial = new StandardMaterial("enemyMaterial");
    enemyMaterial.diffuseColor = new Color3(1, 0, 0);
    scene.registerBeforeRender(() => {
      if (playerMesh.intersectsMesh(enemyMesh, false)) {
        this.changeMaterial(enemyMaterial);
      } else {
        this.changeMaterial(antMaterial);
      }
    });
  }
}
