import {
  ArcRotateCamera,
  DirectionalLight,
  HemisphericLight,
  Vector3,
  Scene,
  StandardMaterial,
  MeshBuilder,
} from "@babylonjs/core";
import createNavigationFeatures from "../Features/NavigationFeatures";
import PlayerAnt from "../GameObjects/PlayerAnt";
import createARFeatures from "../Features/ARFeatures";
import FriendAnt from "../GameObjects/FriendAnt";
import EnemyAnt from "../GameObjects/EnemyAnt";
import { GameLogic } from "../Features/GameLogic";
import TreeStump from "../GameObjects/TreeStump";

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
  groundMesh[0].position = new Vector3(0, 0, 5);
  let groundMaterial = new StandardMaterial("groundMaterial", scene);
  groundMesh[0].material = groundMaterial;
  groundMaterial.alpha = 0;

  //AR Features aktivieren
  await createARFeatures(scene);

  // NavigationFeatures erstellen und Crowd erhalten
  const { navigationPlugin, crowd } = await createNavigationFeatures(
    scene,
    groundMesh,
    false
  );

  GameLogic();

  //Player Box
  const playerAnt = new PlayerAnt(
    new Vector3(0, 0, 1),
    scene,
    navigationPlugin,
    crowd
  );

  playerAnt.ready.then(() => {
    spawnAntRandomly();
  });

  const spawnAntRandomly = () => {
    let randomNumber = Math.random();
    if (randomNumber > 0.5) {
      new EnemyAnt(
        playerAnt.createRandomPointOnNavMesh(),
        scene,
        navigationPlugin,
        crowd,
        playerAnt
      );
    } else {
      new FriendAnt(
        playerAnt.createRandomPointOnNavMesh(),
        scene,
        navigationPlugin,
        crowd,
        playerAnt
      );
    }
  };

  const startTree = new TreeStump(scene, new Vector3(0, 0, 0), navigationPlugin);

}
