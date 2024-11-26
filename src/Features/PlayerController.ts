
import { Scene } from "@babylonjs/core";
import BoxObject from "../GameObjects/BoxObject";

export default function PlayerController (scene: Scene, playerObject: BoxObject) {
    
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
        playerObject.moveBox(clickedPosition);
    };
}
