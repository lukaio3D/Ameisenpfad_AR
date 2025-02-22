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
  WebXRSessionManager,
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
  // Licht einrichten
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;

  const dirLight = new DirectionalLight(
    "dirLight",
    new Vector3(0, -1, -0.5),
    scene
  );
  dirLight.position = new Vector3(0, 5, -5);

  // GroundMesh erstellen
  const groundMesh = MeshBuilder.CreateGround(
    "ground",
    { width: 5, height: 5 },
    scene
  );
  groundMesh.position = new Vector3(0, -0.1, 2.5);
  const groundMaterial = new StandardMaterial("groundMaterial", scene);
  groundMesh.material = groundMaterial;
  groundMaterial.alpha = 0;

  let { camera, skybox } = await createCamera(canvas, scene);

  // NavigationFeatures erstellen und Crowd erhalten
  const { navigationPlugin, crowd } = await createNavigationFeatures(
    scene,
    [groundMesh],
    false
  );

  GameLogic(scene, navigationPlugin, crowd);

  // new TreeStump(scene, new Vector3(0, 0, 0), navigationPlugin);

  // AR über Start Button auslösen
  const startARButton = document.getElementById(
    "startARButton"
  ) as HTMLButtonElement;
  //Prüfen, ob AR-Modus unterstützt wird
  if (await WebXRSessionManager.IsSessionSupportedAsync("immersive-ar") && startARButton) {
    startARButton.style.display = "block";
    
    // Benannte Event-Handler-Funktion, die sich selbst entfernt:
    async function handleStartARClick() {
      // Eventlistener selbst entfernen
      startARButton.removeEventListener("click", handleStartARClick);

      // AR-Features initialisieren
      await createARFeatures(scene).then(() => {
        skybox.dispose();
      });
    }
    
    startARButton.addEventListener("click", handleStartARClick);
  }
}
