import {
  DeviceOrientationCamera,
  DirectionalLight,
  HemisphericLight,
  Vector3,
  Scene,
  StandardMaterial,
  MeshBuilder,
  TransformNode,
  VideoTexture,
} from "@babylonjs/core";
import createNavigationFeatures from "../Features/NavigationFeatures";
import createARFeatures from "../Features/ARFeatures";
import { GameLogic } from "../Features/GameLogic";
import TreeStump from "../GameObjects/TreeStump";

export default async function createAntCommunicationScene(
  canvas: HTMLCanvasElement,
  scene: Scene
) {
  // Kamera einrichten
  const camera = new DeviceOrientationCamera("camera", new Vector3(0, 1.5, -0.5), scene);
  camera.setTarget(new Vector3(0, 0, 1));

  // Kamerabewegung glätten
  camera.inertia = 0.9; // Höherer Wert glättet die Bewegung

  // Überprüfung, ob das Gerät mobil ist
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  if (isMobile) {
    // Auf mobilen Geräten die Kamera-Steuerung aktivieren
    camera.attachControl(canvas, true);

    // Zugriff auf die Kamera erhalten
    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true; // Wichtig für mobile Geräte

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
    } catch (error) {
      console.error('Fehler beim Zugriff auf die Kamera:', error);
      return;
    }

    // Video-Textur erstellen
    const videoTexture = new VideoTexture("videoTexture", video, scene, true, true);

    // Hintergrundmaterial erstellen
    const backgroundMaterial = new StandardMaterial("backgroundMaterial", scene);
    backgroundMaterial.diffuseTexture = videoTexture;
    backgroundMaterial.emissiveTexture = videoTexture;
    backgroundMaterial.backFaceCulling = false;

    // Hintergrund-Ebene erstellen
    const backgroundPlane = MeshBuilder.CreatePlane(
      "backgroundPlane",
      { width: 20, height: 20 },
      scene
    );
    backgroundPlane.position.z = camera.position.z + 0.1; // Ebene vor der Kamera platzieren
    backgroundPlane.parent = camera; // Ebene an die Kamera anhängen
    backgroundPlane.material = backgroundMaterial;
  } else {
    // Auf Desktop-Geräten die Kamera-Steuerung deaktivieren
    camera.inputs.clear();
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
