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
  ShadowGenerator,
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

	var dirLight = new DirectionalLight("dir01", new Vector3(-1, -2, -1), scene);
	dirLight.position = new Vector3(20, 40, 20);
	dirLight.intensity = 0.5;

  const groundMesh = MeshBuilder.CreateGround(
    "ground",
    { width: 5, height: 5 },
    scene
  );

  groundMesh.position = new Vector3(0, -0.1, 2.5);
  const groundMaterial = new StandardMaterial("groundMaterial", scene);
  groundMesh.material = groundMaterial;
  groundMaterial.alpha = 0;



  // Schatten Setup
  const shadowGenerator = new ShadowGenerator(1024, dirLight);
  shadowGenerator.useExponentialShadowMap = true;
  groundMesh.receiveShadows = true;

  let { camera, skybox } = await createCamera(canvas, scene);

  // NavigationFeatures erstellen und Crowd erhalten
  const { navigationPlugin, crowd } = await createNavigationFeatures(
    scene,
    [groundMesh],
    false
  );

  GameLogic(scene, navigationPlugin, crowd, shadowGenerator);

  // new TreeStump(scene, new Vector3(0, 0, 0), navigationPlugin);

  const startARButton = document.getElementById(
    "startARButton"
  ) as HTMLButtonElement;

  // Prüfen, ob AR unterstützt wird und Button sichtbar machen:
  if (await WebXRSessionManager.IsSessionSupportedAsync("immersive-ar")) {
    // AR über Start Button auslösen

    startARButton.style.display = "flex";
    startARButton.addEventListener("click", async () => {
      // AR-Features initialisieren
      await createARFeatures(scene).then(() => {
        skybox.dispose();
      });
    });
  }
}
