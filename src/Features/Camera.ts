import {
  ArcRotateCamera,
  DeviceOrientationCamera,
  FreeCamera,
  MeshBuilder,
  PhotoDome,
  Quaternion,
  StandardMaterial,
  Vector3,
  VideoTexture,
  Color3,
  Scene,
  WebXRSessionManager,
} from "@babylonjs/core";

import treeSkybox from "../assets/woods_4k.jpg";

export default async function createCamera(
  canvas: HTMLCanvasElement,
  scene: Scene
) {
  // Überprüfung, ob das Gerät mobil ist
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  let camera: FreeCamera;
  let skybox: PhotoDome;

  // Skybox erstellen
  skybox = new PhotoDome("Skybox", treeSkybox, {}, scene);

  if (isMobile) {
    // DeviceOrientation Berechtigungen anfordern
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const permission = await (
          DeviceOrientationEvent as any
        ).requestPermission();
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
    camera = new DeviceOrientationCamera(
      "camera",
      new Vector3(-3, 1.6, 2.5), // Augenhöhe
      scene
    );
    camera.setTarget(new Vector3(0, 0, 0));

    // Kamera-Einstellungen
    camera.fov = 0.9;
    camera.minZ = 0.1;
    camera.inertia = 0.3;
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
    // Desktop-Kamera-Setup
    camera = new FreeCamera("camera", new Vector3(0, 5, -5), scene);
    camera.setTarget(new Vector3(0, 0, 2.5));
    camera.attachControl(canvas, true);
    skybox.dispose();
  }

  return { camera, skybox };
}
