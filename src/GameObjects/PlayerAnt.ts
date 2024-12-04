import AntObject from "./AntObject";
import PlayerController from "../Features/PlayerController";
import {
  BoundingBox,
  BoundingSphere,
  Color3,
  Mesh,
  MeshBuilder,
  Vector3,
} from "@babylonjs/core";
import { allAnts } from "../Features/GameLogic";
import NonPlayerAnt from "./NonPlayerAnt";
import EnemyAnt from "./EnemyAnt";
import FriendAnt from "./FriendAnt";

export default class PlayerAnt extends AntObject {
  private health: number = 100;
  private checkProximityMesh: Mesh;
  private isBeingFollowed: boolean = false;
  private isBeingIdentified: boolean = false;

  constructor(startPosition, scene, navigationPlugin, crowd) {
    super("PlayerAnt", startPosition, scene, navigationPlugin, crowd);
    PlayerController(scene, this);
    this.ready.then(() => {
      this.createCheckProximityMesh();
    });
  }

  private createCheckProximityMesh() {
    this.checkProximityMesh = MeshBuilder.CreateCylinder(
      "checkProximityMesh",
      { diameter: 2, height: 0.3 },
      this.scene
    );
    this.checkProximityMesh.parent = this;
    this.checkProximityMesh.isVisible = false;
    this.checkProximityMesh.showBoundingBox = true;
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

  public getIsBeingFollowed() {
    return this.isBeingFollowed;
  }

  public setIsBeingFollowed(value: boolean) {
    this.isBeingFollowed = value;
  }

  public getIsBeingIdentified() {
    return this.isBeingIdentified;
  }

  public setIsBeingIdentified(value: boolean) {
    this.isBeingIdentified = value;
  }
}
