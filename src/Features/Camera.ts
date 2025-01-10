import {
  ArcRotateCamera,
  DeviceOrientationCamera,
  FreeCamera,
  MeshBuilder,
  Quaternion,
  StandardMaterial,
  Vector3,
  VideoTexture,
} from "@babylonjs/core";

export default function createCamera(canvas, scene) {
  // Überprüfung, ob das Gerät mobil ist
  const isMobile =
    /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  let camera: FreeCamera;

  if (isMobile) {
    // DeviceOrientation Berechtigungen anfordern
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const permission = (DeviceOrientationEvent as any).requestPermission();
        if (permission !== "granted") {
          console.error("DeviceOrientation Berechtigung nicht erteilt");
          return;
        }
      } catch (error) {
        console.error(
          "Fehler beim Anfordern der DeviceOrientation Berechtigung:",
          error
        );
        return;
      }
    }

    // Kamera erstellen
    const camera = new DeviceOrientationCamera(
      "camera",
      new Vector3(0, 1.6, -0.5), // Augenhöhe
      scene
    );

    // Kamera-Einstellungen
    camera.fov = 0.8;
    camera.inertia = 0.5;
    camera.angularSensibility = 2000;
    camera.setTarget(new Vector3(0, 1.6, 1));

    // Touch Controls aktivieren
    camera.attachControl(canvas, true);

    // Bewegungsglättung
    let filteredQuaternion = camera.rotationQuaternion?.clone();
    const smoothFactor = 0.1;

    scene.onBeforeRenderObservable.add(() => {
      if (camera.rotationQuaternion && filteredQuaternion) {
        Quaternion.SlerpToRef(
          filteredQuaternion,
          camera.rotationQuaternion,
          smoothFactor,
          filteredQuaternion
        );
        camera.rotationQuaternion.copyFrom(filteredQuaternion);
      }
    });
  } else {
    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 4,
      10,
      new Vector3(0, 0, 2.5),
      scene
    );
    camera.attachControl(canvas, true);
  }
}
