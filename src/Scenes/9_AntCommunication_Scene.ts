import {
  DeviceOrientationCamera,
  HemisphericLight,
  Vector3,
  Scene,
  StandardMaterial,
  MeshBuilder,
  TransformNode,
  VideoTexture,
  DirectionalLight,
} from "@babylonjs/core";
import createNavigationFeatures from "../Features/NavigationFeatures";
import createARFeatures from "../Features/ARFeatures";
import { GameLogic } from "../Features/GameLogic";
import TreeStump from "../GameObjects/TreeStump";

export default async function createAntCommunicationScene(
  canvas: HTMLCanvasElement,
  scene: Scene
) {
  // Überprüfung, ob das Gerät mobil ist
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  let camera;

  if (isMobile) {
    // Kamera für mobile Geräte
    camera = new DeviceOrientationCamera("camera", new Vector3(0, 1.5, -0.5), scene);
    camera.setTarget(new Vector3(0, 0, 1));
    camera.inertia = 0.9; // Glättet die Bewegung
    camera.attachControl(canvas, true);

    // Live-Kamera als Hintergrund
    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
    } catch (error) {
      console.error('Fehler beim Zugriff auf die Kamera:', error);
      return;
    }

    const videoTexture = new VideoTexture("videoTexture", video, scene, true, true);
    const backgroundMaterial = new StandardMaterial("backgroundMaterial", scene);
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
    camera = new DeviceOrientationCamera("camera", new Vector3(0, 5, -2), scene);
    camera.setTarget(new Vector3(0, 2, 0));
    camera.inputs.clear(); // Deaktiviert Bewegung auf Desktop
  }

  // Licht einrichten
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;

  const dirLight = new DirectionalLight(
    "dirLight",
    new Vector3(0, -1, -0.5),
    scene
  );
  dirLight.position = new Vector3(0, 5, -5);

  //GroundMesh erstellen
  const groundMesh = [
    MeshBuilder.CreateGround("ground", { width: 5, height: 5 }, scene),
  ];
  groundMesh[0].position = new Vector3(0, -0.1, 2.5);
  let groundMaterial = new StandardMaterial("groundMaterial", scene);
  groundMesh[0].material = groundMaterial;
  groundMaterial.alpha = 0;

  //AR Features aktivieren
  let sceneParent: TransformNode = new TransformNode ("sceneParent", scene);
  await createARFeatures(scene, sceneParent);

  // NavigationFeatures erstellen und Crowd erhalten
  const { navigationPlugin, crowd } = await createNavigationFeatures(
    scene,
    groundMesh,
    false
  );

  GameLogic(scene, navigationPlugin, crowd);

  new TreeStump(scene, new Vector3(0, 0, 0), navigationPlugin);


}
