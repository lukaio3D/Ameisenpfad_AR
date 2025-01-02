import {
  DeviceOrientationCamera,
  FreeCamera,
  Vector3,
  Quaternion,
  Scene,
} from "@babylonjs/core";

export default function createCamera(canvas, scene: Scene) {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  let camera: FreeCamera;

  if (isMobile) {
    // Mobile Kamera-Setup
    camera = new DeviceOrientationCamera(
      "camera",
      new Vector3(0, 1.6, -0.5), // Augenhöhe eines durchschnittlichen Menschen
      scene
    );

    // Kamera-Einstellungen
    camera.inertia = 0.5; // Trägheit für smoothere Bewegung
    camera.angularSensibility = 2000; // Rotationsempfindlichkeit
    camera.speed = 0.5; // Bewegungsgeschwindigkeit
    
    // Aktiviere Touch-Kontrollen
    camera.attachControl(canvas, true);

    // Bewegungsglättung
    let filteredQuaternion = camera.rotationQuaternion.clone();
    const smoothFactor = 0.1; // Niedriger Wert = smoothere Bewegung

    scene.onBeforeRenderObservable.add(() => {
      if (camera.rotationQuaternion) {
        Quaternion.SlerpToRef(
          filteredQuaternion,
          camera.rotationQuaternion,
          smoothFactor,
          filteredQuaternion
        );
        camera.rotationQuaternion.copyFrom(filteredQuaternion);
      }
    });

    // Setze initiale Blickrichtung
    camera.setTarget(new Vector3(0, 1.6, 1));
  } else {
    // Desktop-Kamera-Setup
    camera = new FreeCamera("camera", new Vector3(0, 10, -10), scene);
    camera.setTarget(Vector3.Zero());
  }

  return camera;
}
