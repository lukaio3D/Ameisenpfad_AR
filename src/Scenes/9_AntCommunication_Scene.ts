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

  // Größeres GroundMesh erstellen und grün färben
  const grass = MeshBuilder.CreateGround(
    "grass",
    { width: 50, height: 50 },
    scene
  );
  grass.position = new Vector3(0, -0.1, 0);
  const grassMaterial = new StandardMaterial("grassMaterial", scene);
  const woodsGroundTexture = new Texture(woodsGround, scene);
  woodsGroundTexture.uScale = 10; // Skalierung der Textur in U-Richtung
  woodsGroundTexture.vScale = 10; // Skalierung der Textur in V-Richtung
  grassMaterial.diffuseTexture = woodsGroundTexture;
  grassMaterial.specularColor = new Color3(0, 0, 0); // Kein Glanz
  grassMaterial.diffuseColor = new Color3(0.4, 0.4, 0.4); // Dunkleres Grün
  grass.material = grassMaterial;

  //AR Features aktivieren
  let sceneParent: TransformNode = new TransformNode("sceneParent", scene);
  let xrHelper = await createARFeatures(scene, sceneParent);

  // Überwachung des AR-Modus
  xrHelper.baseExperience.sessionManager.onXRSessionInit.add(() => {
    groundMaterial.alpha = 0; // Transparent im AR-Modus
  });

  xrHelper.baseExperience.sessionManager.onXRSessionEnded.add(() => {
    groundMaterial.alpha = 1; // Wieder sichtbar, wenn AR-Modus beendet
  });

  // NavigationFeatures erstellen und Crowd erhalten
  const { navigationPlugin, crowd } = await createNavigationFeatures(
    scene,
    [groundMesh],
    false
  );

  GameLogic(scene, navigationPlugin, crowd);

  new TreeStump(scene, new Vector3(0, 0, 0), navigationPlugin);
}
