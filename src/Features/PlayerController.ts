import { Scene } from "@babylonjs/core";
import AntObject from "../GameObjects/AntObject";

export default function PlayerController (scene: Scene, playerObject: AntObject) {
    
    // Methode um Mausposition auf einem Mesh in der Szene zu erhalten
    let getGroundPosition = function () {
      let pickinfo = scene.pick(scene.pointerX, scene.pointerY);
      if (pickinfo.hit) {
        return pickinfo.pickedPoint;
      }
      return null;
    };

    scene.onPointerDown = () => {
      let clickedPosition = getGroundPosition();
      if (clickedPosition) {
        playerObject.moveAnt(clickedPosition);
      }
    };
}
