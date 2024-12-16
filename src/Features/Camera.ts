import {
  DeviceOrientationCamera,
  MeshBuilder,
  StandardMaterial,
  Vector3,
  VideoTexture,
} from "@babylonjs/core";

export default async function createCamera(canvas, scene) {
  // Überprüfung, ob das Gerät mobil ist
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  let camera;

  if (isMobile) {
    // Kamera für mobile Geräte
    camera = new DeviceOrientationCamera(
      "camera",
      new Vector3(0, 1.5, -0.5),
      scene
    );
    camera.setTarget(new Vector3(0, 0, 1));
    // Sets the sensitivity of the camera to movement and rotation
    camera.angularSensibility = 10;
    camera.moveSensibility = 10;
    camera.attachControl(canvas, true);

    // Live-Kamera als Hintergrund
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
    } catch (error) {
      console.error("Fehler beim Zugriff auf die Kamera:", error);
      return;
    }

    const videoTexture = new VideoTexture(
      "videoTexture",
      video,
      scene,
      true,
      true
    );
    const backgroundMaterial = new StandardMaterial(
      "backgroundMaterial",
      scene
    );
    backgroundMaterial.diffuseTexture = videoTexture;
    backgroundMaterial.emissiveTexture = videoTexture;
    backgroundMaterial.backFaceCulling = false;

    const backgroundPlane = MeshBuilder.CreatePlane(
      "backgroundPlane",
      { width: 20, height: 20 },
      scene
    );
    backgroundPlane.position.z = camera.position.z + 0.1;
    backgroundPlane.parent = camera;
    backgroundPlane.material = backgroundMaterial;
  } else {
    // Kamera für Desktop
    camera = new DeviceOrientationCamera(
      "camera",
      new Vector3(0, 5, -2),
      scene
    );
    camera.setTarget(new Vector3(0, 2, 0));
    camera.inputs.clear(); // Deaktiviert Bewegung auf Desktop
  }
}
