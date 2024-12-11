import {
  Scene,
  TransformNode,
  Vector3,
  Quaternion,
  IWebXRHitResult,
  WebXRHitTest,
  WebXRAnchorSystem,
  WebXRBackgroundRemover,
  MeshBuilder,
  WebXRFeaturesManager,
  WebXRState,
} from "@babylonjs/core";
import { UIManager } from "./UIManager"; // Passen Sie den Pfad entsprechend an

export default async function createARFeatures(
  scene: Scene,
  sceneParent: TransformNode
) {
  try {
    console.log("ARFeatures: Initialisierung gestartet.");

    // AR-Erfahrung erstellen
    const xr = await scene.createDefaultXRExperienceAsync({
      uiOptions: {
        sessionMode: "immersive-ar",
        referenceSpaceType: "local-floor",
      },
      optionalFeatures: true,
    });

    console.log("ARFeatures: XR-Erfahrung erstellt.");

    const fm = xr.baseExperience.featuresManager;

    // WebXR-Hit-Test aktivieren
    const xrHitTest = fm.enableFeature(
      WebXRHitTest.Name,
      "latest"
    ) as WebXRHitTest;

    // WebXR-Anchor-System aktivieren
    const xrAnchors = fm.enableFeature(
      WebXRAnchorSystem.Name,
      "latest"
    ) as WebXRAnchorSystem;

    // WebXR-Background-Remover aktivieren (optional)
    const xrBackgroundRemover = fm.enableFeature(
      WebXRBackgroundRemover.Name
    );

    // Visueller Marker für den Hit-Test
    const marker = MeshBuilder.CreateTorus(
      "marker",
      { diameter: 0.15, thickness: 0.05 },
      scene
    );
    marker.isVisible = false;
    marker.rotationQuaternion = new Quaternion();

    let hitTestResult: IWebXRHitResult | null = null;

    // Hit-Test-Ergebnisse überwachen
    xrHitTest.onHitTestResultObservable.add((results) => {
      if (results.length) {
        marker.isVisible = true;
        hitTestResult = results[0];

        // TransformationMatrix aus dem Hit-Test-Ergebnis extrahieren
        const transformationMatrix = hitTestResult.transformationMatrix;
        transformationMatrix.decompose(
          undefined,
          marker.rotationQuaternion,
          marker.position
        );
      } else {
        marker.isVisible = false;
        hitTestResult = null;
      }
    });

    // Anker hinzufügen, wenn verfügbar
    if (xrAnchors) {
      console.log("ARFeatures: Anchor-System aktiviert.");

      xrAnchors.onAnchorAddedObservable.add((anchor) => {
        console.log("ARFeatures: Anker hinzugefügt:", anchor);

        // Szene an den Anker anhängen
        const attachedNode = sceneParent.clone("sceneClone", sceneParent);
        attachedNode.parent = anchor.attachedNode;

        // Position und Rotation zurücksetzen
        attachedNode.position = Vector3.Zero();
        attachedNode.rotationQuaternion = Quaternion.Identity();

        console.log("ARFeatures: Szene an Anker gebunden.");
      });

      xrAnchors.onAnchorRemovedObservable.add((anchor) => {
        console.log("ARFeatures: Anker entfernt:", anchor);
        if (anchor.attachedNode) {
          anchor.attachedNode.dispose();
        }
      });
    }

    // Pointer-Down-Ereignis überwachen
    scene.onPointerDown = (evt, pickInfo) => {
      if (
        hitTestResult &&
        xrAnchors &&
        xr.baseExperience.state === WebXRState.IN_XR
      ) {
        xrAnchors
          .addAnchorPointUsingHitTestResultAsync(hitTestResult)
          .then(() => {
            console.log("ARFeatures: Anker hinzugefügt.");
          })
          .catch((error) => {
            console.error("ARFeatures: Fehler beim Hinzufügen des Ankers:", error);
            // Fehler über UIManager ausgeben
            const uiManager = UIManager.getInstance();
            uiManager.displayMessage(error.message);
          });
      }
    };

    console.log("ARFeatures: Initialisierung abgeschlossen.");
  } catch (error) {
    console.error("ARFeatures: Fehler während der Initialisierung:", error);
    // Fehler über UIManager ausgeben
    const uiManager = UIManager.getInstance();
    uiManager.displayMessage(error.message);
  }
}