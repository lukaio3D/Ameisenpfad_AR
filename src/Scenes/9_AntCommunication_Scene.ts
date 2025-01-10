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
  //Kamera erstellen
  createCamera(canvas, scene);

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
  const skybox = new PhotoDome("Skybox", treeSkybox, {}, scene);

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

  if (await WebXRSessionManager.IsSessionSupportedAsync("immersive-ar")) {
    console.log("AR wird unterstützt");
    await createARFeatures(scene, sceneParent);
  } else {
    console.log("AR wird nicht unterstützt");
  }

  // NavigationFeatures erstellen und Crowd erhalten
  const { navigationPlugin, crowd } = await createNavigationFeatures(
    scene,
    [groundMesh],
    false
  );

  GameLogic(scene, navigationPlugin, crowd);

  new TreeStump(scene, new Vector3(0, 0, 0), navigationPlugin);
}
