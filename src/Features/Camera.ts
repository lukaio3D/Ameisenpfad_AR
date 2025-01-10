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
} from "@babylonjs/core";

import treeSkybox from "../assets/woods_4k.jpg";

export default async function createCamera(canvas: HTMLCanvasElement, scene: Scene) {
  // Überprüfung, ob das Gerät mobil ist
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  let camera: FreeCamera;

  if (isMobile) {
    // Button zur Berechtigungsanfrage erstellen
    const permissionButton = document.createElement("button");
    permissionButton.innerText = "Bewegungssensor aktivieren";
    permissionButton.style.position = "absolute";
    permissionButton.style.top = "10px";
    permissionButton.style.left = "10px";
    permissionButton.style.zIndex = "1000";
    document.body.appendChild(permissionButton);

    permissionButton.addEventListener("click", async () => {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof (DeviceOrientationEvent as any).requestPermission === "function"
      ) {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === "granted") {
            // Kamera erstellen
            camera = new DeviceOrientationCamera(
              "camera",
              new Vector3(0, 1.6, -0.5), // Augenhöhe
              scene
            );

            // Kamera-Einstellungen
            camera.fov = 0.9;
            camera.minZ = 0.1;
            camera.inertia = 0.3;
            camera.angularSensibility = 2000;
            camera.setTarget(new Vector3(0, 1.6, 1));

            // Skybox erstellen
            const skybox = new PhotoDome("Skybox", treeSkybox, {}, scene);

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

            // Button entfernen
            permissionButton.remove();
          } else {
            console.error("DeviceOrientation Berechtigung nicht erteilt");
          }
        } catch (error) {
          console.error("Fehler beim Anfordern der DeviceOrientation Berechtigung:", error);
        }
      } else {
        // Fallback für Geräte, die keine Berechtigungsanfrage benötigen
        initCamera();
        permissionButton.remove();
      }
    });
  } else {
    // Desktop-Kamera-Setup
    camera = new FreeCamera("camera", new Vector3(0, 10, -10), scene);
    camera.setTarget(Vector3.Zero());
  }

  function initCamera() {
    camera = new DeviceOrientationCamera(
      "camera",
      new Vector3(0, 1.6, -0.5), // Augenhöhe
      scene
    );

    // Kamera-Einstellungen
    camera.fov = 0.9;
    camera.minZ = 0.1;
    camera.inertia = 0.3;
    camera.angularSensibility = 2000;
    camera.setTarget(new Vector3(0, 1.6, 1));

    // Skybox erstellen
    const skybox = new PhotoDome("Skybox", treeSkybox, {}, scene);

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
  }

  return camera;
}
