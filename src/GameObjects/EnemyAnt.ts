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
  private enemyHealth: number = 100;

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
    this.enemyHealth = health;
    if (this.enemyHealth > 100) {
      this.enemyHealth = 100;
    }
  }

  public getEnemyHealth() {
    return this.enemyHealth;
  }

  public substractEnemyHealth(damage: number) {
    this.enemyHealth -= damage;
    if(this.enemyHealth <= 0) {
      this.dispose();
      console.log(this);
    }
  }


  
}
