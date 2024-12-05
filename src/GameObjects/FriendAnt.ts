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

export default class FriendAnt extends NonPlayerAnt {
  private friendMaterial: StandardMaterial;

  constructor(
    startPosition: Vector3,
    scene: Scene,
    navigationPlugin: RecastJSPlugin,
    crowd,
    assignedPlayerAnt: PlayerAnt
  ) {
    super(
      "FriendAnt",
      startPosition,
      scene,
      navigationPlugin,
      crowd,
      assignedPlayerAnt
    );
    this.playerAnt = assignedPlayerAnt;
    this.identifierColor = new Color3(0, 1, 0); // Grüne Farbe für friend Ant
    this.ready.then(() => {
      this.initializeFriendAnt(scene, this.playerAnt);
    });
  }

  private initializeFriendAnt(scene: Scene, playerAnt: PlayerAnt) {
    this.randomMove();
    this.friendMaterial = new StandardMaterial("FriendMaterial", this.scene);
    this.friendMaterial.diffuseColor = new Color3(1, 0, 0); // Rotes Material für friend Ant
  }
}
