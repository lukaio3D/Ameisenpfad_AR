import {
  ArcRotateCamera,
  DirectionalLight,
  HemisphericLight,
  loadAssetContainerAsync,
  Scene,
  RecastJSPlugin,
  Vector3,
} from "@babylonjs/core";
import createNavigationFeatures from "../Features/NavigationFeatures";
import createARFeatures from "../Features/ARFeatures";
import Recast from "recast-detour";

export default async function createAntCommunicationScene(
  engine,
  canvas,
  scene
) {
  // This creates and positions a free camera (non-mesh)
  var camera = new ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 2.5,
    5,
    Vector3.Zero(),
    scene
  );

  // This targets the camera to scene origin
  camera.setTarget(Vector3.Zero());

  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;

  var dirLight = new DirectionalLight("light", new Vector3(0, -1, -0.5), scene);
  dirLight.position = new Vector3(0, 5, -5);

  const container = loadAssetContainerAsync("assets/240920_AntAnim.glb", scene);
  (await container).addAllToScene();
  const antContainer = (await container).createRootMesh();
  const ant = scene.getMeshByName("Ant");
  ant.rotate(Vector3.Up(), -Math.PI / 2);
  const antAnim = scene.getAnimationGroupByName("Armature Ant");

  await createNavigationFeatures(scene, antContainer, antAnim);
  await createARFeatures(scene, ant, antAnim);
}
