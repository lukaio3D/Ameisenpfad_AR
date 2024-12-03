import AntObject from "./AntObject";
import PlayerController from "../Features/PlayerController";
import { Color3 } from "@babylonjs/core";

export default class PlayerAnt extends AntObject {
  private health: number = 100;

  constructor(startPosition, scene, navigationPlugin, crowd) {
    super(startPosition, scene, navigationPlugin, crowd);
    PlayerController(scene, this);
  }

  public getHealth() {
    return this.health;
  }

  public setHealth(health: number) {
    this.health = health;
    if(this.health > 100){
      this.health = 100;
    }
  }

}
