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
import PlayerAnt from "../GameObjects/PlayerAnt";
import PlayerController from "../Features/PlayerController";
import createARFeatures from "../Features/ARFeatures";
import AntObject from "../GameObjects/AntObject";
import FriendAnt from "../GameObjects/FriendAnt";
import EnemyAnt from "../GameObjects/EnemyAnt";

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

  //Player Box
  const playerAnt = new PlayerAnt(
    new Vector3(0, 0, 0),
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

  // Jetzt können Sie weitere Aktionen mit ant1 durchführen

  // const ant2 = new Ant(scene, new Vector3(2, 0, -2), navigationPlugin, crowd);
  // const ant3 = new Ant(scene, new Vector3(-2, 0, 2), navigationPlugin, crowd);

  // setTimeout(() => {
  //   // Ameisen bewegen (Beispiel)
  //   ant2.changeMaterial(new StandardMaterial("antMaterial", scene));
  //   ant2.moveAntToPosition(new Vector3(2, 0, 2));
  //   crowd.agentGoto(0, navigationPlugin.getClosestPoint(new Vector3(2, 0, 2)));
  // }, 2000);
}
