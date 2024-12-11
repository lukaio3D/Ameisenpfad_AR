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
  const uiManager = UIManager.getInstance();

  try {
    // XR Experience erstellen
    const xrHelper = await scene.createDefaultXRExperienceAsync({
      uiOptions: { sessionMode: "immersive-ar" },
      optionalFeatures: ["anchors", "hit-test"],
    });
    uiManager.displayMessage("XR-Erfahrung erfolgreich erstellt.");

    // Anchor-System aktivieren
    const featuresManager = xrHelper.baseExperience.featuresManager;
    const anchorSystem = featuresManager.enableFeature(
      WebXRAnchorSystem,
      "latest"
    ) as WebXRAnchorSystem;

    if (anchorSystem) {
      uiManager.displayMessage("Anchor-System aktiviert.");
    } else {
      uiManager.displayMessage("Fehler beim Aktivieren des Anchor-Systems.");
    }

    const hitTest = featuresManager.enableFeature(WebXRHitTest, "latest");
    if (hitTest) {
      uiManager.displayMessage("Hit-Test aktiviert.");
    } else {
      uiManager.displayMessage("Fehler beim Aktivieren des Hit-Tests.");
    }

    // Hit-Test-Ergebnis überwachen
    (hitTest as WebXRHitTest).onHitTestResultObservable.add(async (results) => {
      if (results.length) {
        const hit = results[0];

        // Anchor erstellen
        const tempNode = new TransformNode("temp", scene);
        const position = new Vector3();
        const rotationQuaternion = new Quaternion();
        hit.transformationMatrix.decompose(undefined, rotationQuaternion, position);

        const anchor = await anchorSystem.addAnchorAtPositionAndRotationAsync(
          position,
          rotationQuaternion
        );

        if (anchor) {
          uiManager.displayMessage("Anker erfolgreich erstellt.");

          // Verknüpftes Objekt hinzufügen
          const box = MeshBuilder.CreateBox("box", { size: 0.2 }, scene);
          box.material = new StandardMaterial("material", scene);
          (box.material as StandardMaterial).diffuseColor = new Color3(1, 0, 0); // Rot
          box.parent = anchor.attachedNode; // Verknüpfen

          uiManager.displayMessage("Objekt erfolgreich platziert.");
        } else {
          uiManager.displayMessage("Fehler beim Erstellen des Ankers.");
        }
      } else {
        uiManager.displayMessage("Kein gültiges Hit-Test-Ergebnis.");
      }
    });
  } catch (error) {
    console.error("Fehler in createARFeatures:", error);
    uiManager.displayMessage("Fehler: " + error.message);
  }
}
