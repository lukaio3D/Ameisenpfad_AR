import { Scene } from "@babylonjs/core";
import AntObject from "../GameObjects/AntObject";

export default function PlayerController(scene: Scene, playerObject: AntObject) {
  let isControlEnabled = true; // Flag, um die Steuerung zu aktivieren oder zu deaktivieren

  // Methode, um die Mausposition auf einem Mesh in der Szene zu erhalten
  let getGroundPosition = function () {
    let pickinfo = scene.pick(scene.pointerX, scene.pointerY);
    if (pickinfo && pickinfo.hit) {
      return pickinfo.pickedPoint;
    }
    return null;
  };

  // Ereignisbehandlung bei Mausklick
  scene.onPointerDown = () => {
    if (!isControlEnabled) return; // Wenn die Steuerung deaktiviert ist, nichts tun

    let clickedPosition = getGroundPosition();
    if (clickedPosition) {
      playerObject.moveAnt(clickedPosition);
    }
  };

  // Methoden, um die Steuerung zu aktivieren oder zu deaktivieren
  return {
    enableControl: function () {
      isControlEnabled = true;
    },
    disableControl: function () {
      isControlEnabled = false;
    },
  };
}
