import { Scene } from "@babylonjs/core";
import AntObject from "../GameObjects/AntObject";

export default function PlayerController(scene: Scene, playerObject: AntObject) {
  let isControlEnabled = true; // Flag, um die Steuerung zu aktivieren oder zu deaktivieren

  // Methode, um die Mausposition auf einem Mesh in der Szene zu erhalten
  let getGroundPosition = function (event: PointerEvent) {
    let pickinfo = scene.pick(event.clientX, event.clientY);
    if (pickinfo && pickinfo.hit) {
      return pickinfo.pickedPoint;
    }
    return null;
  };

  // Ereignisbehandlung bei Pointer-Down
  const onPointerDown = (event: PointerEvent) => {
    if (!isControlEnabled) return; // Wenn die Steuerung deaktiviert ist, nichts tun

    let clickedPosition = getGroundPosition(event);
    if (clickedPosition) {
      playerObject.moveAnt(clickedPosition);
    }
  };

  scene.onPointerDown = onPointerDown;

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