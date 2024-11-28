import { AbstractMesh, Color3, Mesh, RecastJSPlugin, Scene, Vector3 } from "@babylonjs/core";
import AntObject from "./AntObject";
import PlayerAnt from "./PlayerAnt";

export default class FriendBox extends AntObject {
  constructor(
    startPosition: Vector3,
    scene: Scene,
    navigationPlugin: RecastJSPlugin,
    crowd,
    playerAnt: PlayerAnt
  ) {
    super(startPosition, scene, navigationPlugin, crowd);
    this.ready.then(() => {
        this.initializeFriendAnt(scene, playerAnt);
      });
      
    }
  
    private initializeFriendAnt(scene: Scene, playerAnt: PlayerAnt) {
      this.randomMove();
      this.addFriendBehaviour(scene, this.getMesh(), playerAnt.getMesh());
    }

  private addFriendBehaviour(scene: Scene, friendMesh: AbstractMesh, playerMesh: AbstractMesh) {
    scene.registerBeforeRender(() => {
      if (playerMesh.intersectsMesh(friendMesh, false)) {
        console.log("Friend hit player");
        this.changeColor(new Color3(0, 1, 0));
      } else {
        this.changeColor(new Color3(1, 1, 1));
      }
    });
  }
}
