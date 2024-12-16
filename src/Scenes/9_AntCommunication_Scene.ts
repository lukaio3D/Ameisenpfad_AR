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
import createCamera from "../Features/Camera";

export default async function createAntCommunicationScene(
  canvas: HTMLCanvasElement,
  scene: Scene
) {

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
