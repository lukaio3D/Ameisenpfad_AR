import {
  Color3,
  StandardMaterial,
  RecastJSPlugin,
  Scene,
  Vector3,
  Material,
} from "@babylonjs/core";
import PlayerAnt from "./PlayerAnt";
import NonPlayerAnt from "./NonPlayerAnt";

export default class EnemyAnt extends NonPlayerAnt {
  private enemyMaterial: StandardMaterial;

  constructor(
    startPosition: Vector3,
    scene: Scene,
    navigationPlugin: RecastJSPlugin,
    crowd,
    assignedPlayerAnt: PlayerAnt,
  ) {
    super(
      "EnemyAnt",
      startPosition,
      scene,
      navigationPlugin,
      crowd,
      assignedPlayerAnt
    );
    this.playerAnt = assignedPlayerAnt;
    this.identifierColor = new Color3(1, 0, 0); // Rote Farbe für Enemy Ant
    this.ready.then(() => {
      this.initializeEnemyAnt(scene, this.playerAnt);
    });
  }

  private initializeEnemyAnt(scene: Scene, playerAnt: PlayerAnt) {
    this.randomMove();
    this.enemyMaterial = new StandardMaterial("enemyMaterial", this.scene);
    this.enemyMaterial.diffuseColor = new Color3(1, 0, 0); // Rotes Material für Enemy Ant
  }
}
