import AntObject from "./AntObject";
import PlayerController from "../Features/PlayerController";
import { Mesh, MeshBuilder } from "@babylonjs/core";
import EnemyAnt from "./EnemyAnt";

export default class PlayerAnt extends AntObject {
  private health: number = 100;
  private checkProximityMesh: Mesh;
  private isInInteraction: boolean = false;

  constructor(startPosition, scene, navigationPlugin, crowd) {
    super("PlayerAnt", 0.7, startPosition, scene, navigationPlugin, crowd);
    PlayerController(scene, this);
    this.ready.then(() => {
      this.createCheckProximityMesh();
    });
  }

  private createCheckProximityMesh() {
    this.checkProximityMesh = MeshBuilder.CreateCylinder(
      "checkProximityMesh",
      { diameter: 15, height: 1 },
      this.scene
    );
    this.checkProximityMesh.parent = this;
    this.checkProximityMesh.isVisible = false;
    this.checkProximityMesh.showBoundingBox = false;
  }

  public getCheckProximityMesh() {
    return this.checkProximityMesh;
  }

  public getHealth() {
    return this.health;
  }

  public setHealth(health: number) {
    this.health = health;
    if (this.health > 100) {
      this.health = 100;
    }
  }

  public getIsInInteraction() {
    return this.isInInteraction;
  }

  public setIsInInteraction(isInInteraction: boolean) {
    this.isInInteraction = isInInteraction;
  }
}
