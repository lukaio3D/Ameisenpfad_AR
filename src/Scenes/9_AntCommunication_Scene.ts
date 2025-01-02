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
  CubeTexture,
  Texture,
  Color3,
  PhotoDome,
  WebXRState,
  Quaternion,
} from "@babylonjs/core";
import createNavigationFeatures from "../Features/NavigationFeatures";
import createARFeatures from "../Features/ARFeatures";
import { GameLogic } from "../Features/GameLogic";
import TreeStump from "../GameObjects/TreeStump";
import createCamera from "../Features/Camera";
import treeSkybox from "../assets/SkyBox_GrassAndTrees.jpg";
import woodsGround from "../assets/Grass01_1K_BaseColor.png";

export default async function createAntCommunicationScene(
  canvas: HTMLCanvasElement,
  scene: Scene
) {
  // iOS Berechtigungsbutton erstellen
  const iOSButton = document.createElement('button');
  iOSButton.style.position = 'absolute';
  iOSButton.style.top = '20px';
  iOSButton.style.left = '20px';
  iOSButton.style.zIndex = '1000';
  iOSButton.innerText = 'Bewegungssensor aktivieren';
  document.body.appendChild(iOSButton);

  // iOS Berechtigungslogik
  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          initCamera();
          iOSButton.style.display = 'none';
        } else {
          console.error('DeviceOrientation Berechtigung nicht erteilt');
        }
      } catch (error) {
        console.error('Fehler:', error);
      }
    } else {
      initCamera();
      iOSButton.style.display = 'none';
    }
  };

  iOSButton.addEventListener('click', requestPermission);

  // Kamera-Initialisierung in separate Funktion
  const initCamera = () => {
    const camera = new DeviceOrientationCamera(
      "camera",
      new Vector3(0, 1.6, -0.5),
      scene
    );

    camera.inertia = 0.5;
    camera.angularSensibility = 2000;
    camera.setTarget(new Vector3(0, 1.6, 1));
    camera.attachControl(canvas, true);

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
  };

  // Automatische Initialisierung für nicht-iOS Geräte
  if (!/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    initCamera();
    iOSButton.style.display = 'none';
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

  // Skybox erstellen
  // const skybox = new PhotoDome("Skybox", treeSkybox, {}, scene);

  //GroundMesh erstellen
  const groundMesh = MeshBuilder.CreateGround(
    "ground",
    { width: 5, height: 5 },
    scene
  );
  groundMesh.position = new Vector3(0, -0.1, 2.5);
  const groundMaterial = new StandardMaterial("groundMaterial", scene);
  groundMesh.material = groundMaterial;
  groundMaterial.alpha = 0;

  //AR Features aktivieren
  let sceneParent: TransformNode = new TransformNode("sceneParent", scene);
  // await createARFeatures(scene, sceneParent, skybox);

  // NavigationFeatures erstellen und Crowd erhalten
  const { navigationPlugin, crowd } = await createNavigationFeatures(
    scene,
    [groundMesh],
    false
  );

  GameLogic(scene, navigationPlugin, crowd);

  new TreeStump(scene, new Vector3(0, 0, 0), navigationPlugin);
}
