import {
  Scene,
  TransformNode,
  Vector3,
  Quaternion,
  WebXRHitTest,
  WebXRAnchorSystem,
  MeshBuilder,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";
import { UIManager } from "./UIManager"; // Passen Sie den Pfad entsprechend an

export default async function createARFeatures(
  scene: Scene,
  sceneParent: TransformNode
) {
  // XR Experience erstellen
  const xrHelper = await scene.createDefaultXRExperienceAsync({
    uiOptions: { sessionMode: "immersive-ar" },
    optionalFeatures: ["anchors", "hit-test"],
  });

  // Anchor-System aktivieren
  const featuresManager = xrHelper.baseExperience.featuresManager;
  const anchorSystem = featuresManager.enableFeature(
    WebXRAnchorSystem,
    "latest"
  ) as WebXRAnchorSystem;
  const hitTest = featuresManager.enableFeature(WebXRHitTest, "latest");

  // Hit-Test-Ergebnis überwachen
  (hitTest as WebXRHitTest).onHitTestResultObservable.add(async (results) => {
    if (results.length) {
      const hit = results[0];

      // Anchor erstellen
      const { position, rotationQuaternion } = new TransformNode("temp", scene);
      hit.transformationMatrix.decompose(undefined, rotationQuaternion, position);
      const anchor = await anchorSystem.addAnchorAtPositionAndRotationAsync(position, rotationQuaternion);

      // Verknüpftes Objekt hinzufügen
      const box = MeshBuilder.CreateBox("box", { size: 0.2 }, scene);
      box.material = new StandardMaterial("material", scene);
      (box.material as StandardMaterial).diffuseColor = new Color3(1, 0, 0); // Rot
      box.parent = anchor.attachedNode; // Verknüpfen
    }
  });
}
