import {
  WebXRHitTest,
  WebXRAnchorSystem,
  TransformNode,
  Scene,
  Vector3,
  Quaternion,

  IWebXRHitResult,
} from "@babylonjs/core";

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

    // WebXR Hit-Test aktivieren
    const xrHitTest = fm.enableFeature(
      WebXRHitTest.Name,
      "latest",
      { enableTransientHitTest: true }
    ) as WebXRHitTest;

    if (!xrHitTest) {
      throw new Error("ARFeatures: WebXRHitTest konnte nicht aktiviert werden.");
    }

    console.log("ARFeatures: Hit-Test aktiviert.");

    // WebXR Anchor-System aktivieren
    const xrAnchors = fm.enableFeature(
      WebXRAnchorSystem.Name,
      "latest"
    ) as WebXRAnchorSystem;

    if (!xrAnchors) {
      throw new Error("ARFeatures: WebXRAnchorSystem konnte nicht aktiviert werden.");
    }

    console.log("ARFeatures: Anchor-System aktiviert.");

    let scenePlaced = false;

    // Hit-Test-Ergebnisse überwachen
    xrHitTest.onHitTestResultObservable.add(async (results) => {
      if (results.length > 0 && !scenePlaced) {
        const hitTestResult = results[0] as IWebXRHitResult;

        // TransformationMatrix aus dem Hit-Test-Ergebnis extrahieren
        const transformationMatrix = hitTestResult.transformationMatrix;

        const position = new Vector3();
        const rotationQuaternion = new Quaternion();
        transformationMatrix.decompose(undefined, rotationQuaternion, position);

        // Anker an der ermittelten Position erstellen
        const anchor = await xrAnchors.addAnchorAtPositionAndRotationAsync(
          position,
          rotationQuaternion
        );

        if (!anchor) {
          console.error("ARFeatures: Anker konnte nicht erstellt werden.");
          return;
        }

        console.log("ARFeatures: Anker erstellt.");

        // Szene an den Anker binden
        sceneParent.parent = anchor.attachedNode;

        // Position und Rotation zurücksetzen
        sceneParent.position = Vector3.Zero();
        sceneParent.rotationQuaternion = Quaternion.Identity();

        scenePlaced = true;

        console.log("ARFeatures: Szene platziert und verankert.");

        // Hit-Test deaktivieren
        xrHitTest.onHitTestResultObservable.clear();
      }
    });

    console.log("ARFeatures: Initialisierung abgeschlossen.");
  } catch (error) {
    console.error("ARFeatures: Fehler während der Initialisierung:", error);
  }
}