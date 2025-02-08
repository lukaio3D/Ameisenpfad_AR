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

  const isIOs = /iPhone|iPad|iPod/i.test(navigator.userAgent);

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
      new Vector3(0, 2.5, -1 ), // Augenhöhe
      scene
    );
    camera.rotation = new Vector3(0, Math.PI/2, 0);

    let smoothFactor;

    if (isIOs) {
      // Kamera-Einstellungen iOS
      camera.fov = 0.7;
      camera.minZ = 0.1;
      camera.inertia = 0.3;
      camera.angularSensibility = 2000;
      smoothFactor = 0.1;
    } else {
      // Kamera-Einstellungen Android
      camera.fov = 0.7;
      camera.minZ = 0.1;
      camera.inertia = 0.1;
      camera.angularSensibility = 2000;
      smoothFactor = 0.01;
    }

    // Touch Controls aktivieren
    camera.attachControl(canvas, true);

    // Bewegungsglättung
    let filteredQuaternion = camera.rotationQuaternion?.clone();
    

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
