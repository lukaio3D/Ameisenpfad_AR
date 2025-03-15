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
    this.identifierColor = new Color3(1, 0, 0); // Helleres Rot für Enemy Ant
    this.ready.then(() => {
      this.initializeEnemyAnt(scene, this.playerAnt);
    });
  }

  private initializeEnemyAnt(scene: Scene, playerAnt: PlayerAnt) {
    this.randomMove();
  }

  public setEnemyHealth(health: number) {
    this.antHealth = health;
    if (this.antHealth > 100) {
      this.antHealth = 100;
    }
  }

  public getEnemyHealth() {
    return this.antHealth;
  }

  public substractEnemyHealth(damage: number) {
    this.antHealth -= damage;
    if(this.antHealth <= 0) {
      this.deleteAnt();
    }
  }


  
}
