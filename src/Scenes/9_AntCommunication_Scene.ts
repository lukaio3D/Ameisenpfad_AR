import {
  ArcRotateCamera,
  Color3,
  DirectionalLight,
  HemisphericLight,
  Vector3,
  Scene,
  StandardMaterial,
  RecastJSCrowd,
  MeshBuilder,
  TransformNode,
  IAgentParameters,
} from "@babylonjs/core";
import createNavigationFeatures from "../Features/NavigationFeatures";
import Ant from "../Features/Ant";
import PlayerAnt from "../Features/PlayerAnt";
import BoxObject from "../GameObjects/BoxObject";
import PlayerController from "../Features/PlayerController";
import createARFeatures from "../Features/ARFeatures";

export default async function createAntCommunicationScene(
  canvas: HTMLCanvasElement,
  scene: Scene
) {
  // Kamera einrichten
  const camera = new ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 2.5,
    10,
    Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);

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
    MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene),
  ];

  //AR Features aktivieren
  await createARFeatures(scene);

  // NavigationFeatures erstellen und Crowd erhalten
  const { navigationPlugin, crowd } = await createNavigationFeatures(
    scene,
    groundMesh
  );

  function createRandomPointOnNavMesh() {
    let xCoords = Math.random() * 5 * Math.random() > 0.5 ? -1 : 1;
    let zCoords = Math.random() * 5 * Math.random() > 0.5 ? -1 : 1;
    return navigationPlugin.getClosestPoint(new Vector3(xCoords, 0, zCoords));
  }

  //Player Box
  const box1 = new BoxObject(scene, navigationPlugin, crowd);
  PlayerController(scene, box1);

  //Enemy Box
  const box2 = new BoxObject(scene, navigationPlugin, crowd);
  box2.changeColor(new Color3(1, 0, 0));
  setInterval(() => {
    box2.moveBox(createRandomPointOnNavMesh());
  }, 4000);

  //Friend Box
  const box3 = new BoxObject(scene, navigationPlugin, crowd);
  box3.changeColor(new Color3(0, 1, 0));
  setInterval(() => {
    box3.moveBox(createRandomPointOnNavMesh());
  }, 5000);

  // Ameisen erstellen und Crowd übergeben
  // const ant1 = new PlayerAnt(
  //   scene,
  //   new Vector3(0, 0, 0),
  //   navigationPlugin,
  //   crowd
  // );
  // const ant2 = new Ant(scene, new Vector3(2, 0, -2), navigationPlugin, crowd);
  // const ant3 = new Ant(scene, new Vector3(-2, 0, 2), navigationPlugin, crowd);

  // setTimeout(() => {
  //   // Ameisen bewegen (Beispiel)
  //   ant2.changeMaterial(new StandardMaterial("antMaterial", scene));
  //   ant2.moveAntToPosition(new Vector3(2, 0, 2));
  //   crowd.agentGoto(0, navigationPlugin.getClosestPoint(new Vector3(2, 0, 2)));
  // }, 2000);
}
