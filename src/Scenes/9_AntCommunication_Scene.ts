import {
  ArcRotateCamera,
  Color3,
  DirectionalLight,
  HemisphericLight,
  Vector3,
} from "@babylonjs/core";
import createNavigationFeatures from "../Features/NavigationFeatures";
import createARFeatures from "../Features/ARFeatures";
import Ant from "../Features/Ant";
import PlayerAnt from "../Features/PlayerAnt";

export default async function createAntCommunicationScene(
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



  // Ameisen erstellen und Crowd übergeben
  const ant1 = new PlayerAnt(scene, new Vector3(0, 0, 0));
  const ant2 = new Ant(scene, new Vector3(2, 0, 0));
  const ant3 = new Ant(scene, new Vector3(-2, 0, 0));

  // Optional: Materialien anpassen
  setTimeout(() => {
  ant2.setMaterialColor(new Color3(0, 1, 0)); // Grün
  ant3.setMaterialColor(new Color3(1, 0, 0)); // Rot
  },1000);

  createNavigationFeatures(scene, ant1.getTransformNode());
  createARFeatures(scene, ant1.getTransformNode(), ant1.getAnimationGroup());

}
