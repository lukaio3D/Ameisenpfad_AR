import {
  WebXRAnchorSystem,
  WebXRHitTest,
  WebXRState,
  TransformNode,
  Scene,
  Vector3,
  Quaternion,
  SphereBuilder,
  WebXRDomOverlay,
  WebXRSessionManager,
  IWebXRDomOverlayOptions,
  StandardMaterial,
  IWebXRHitResult,
} from "@babylonjs/core";

export default async function createARFeatures(
  scene: Scene,
  sceneParent: TransformNode
) {
  try {
    console.log("ARFeatures: Initialisierung gestartet.");

    // AR Setup
    const xr = await scene.createDefaultXRExperienceAsync({
      uiOptions: {
        sessionMode: "immersive-ar",
        referenceSpaceType: "local-floor",
      },
      optionalFeatures: true, // Ermöglicht das Aktivieren mehrerer Features
    });

    const sm = new WebXRSessionManager(scene);

    console.log("ARFeatures: XR-Erfahrung erstellt:", xr);

    const fm = xr.baseExperience.featuresManager;

    // WebXR Hit-Test aktivieren
    const xrHitTest = fm.enableFeature(
      WebXRHitTest.Name,
      "latest"
    ) as WebXRHitTest;

    if (!xrHitTest) {
      throw new Error("ARFeatures: WebXRHitTest konnte nicht aktiviert werden.");
    }

    console.log("ARFeatures: Hit-Test aktiviert:", xrHitTest);

    // WebXR Anchor-System aktivieren
    const anchors = fm.enableFeature(
      WebXRAnchorSystem.Name,
      "latest"
    ) as WebXRAnchorSystem;

    if (!anchors) {
      throw new Error("ARFeatures: WebXRAnchorSystem konnte nicht aktiviert werden.");
    }

    console.log("ARFeatures: Anchor-System aktiviert:", anchors);

    let domOverlayOptions: IWebXRDomOverlayOptions = {element: "overlay"};

    // DOM Overlay (optional, z.B. UI-Elemente)
    const domOverlay = new WebXRDomOverlay(sm, domOverlayOptions);

    // Einen visuellen Indikator (Dot) für den Hit-Test erstellen
    const dot = SphereBuilder.CreateSphere(
      "dot",
      {
        diameter: 0.05,
      },
      scene
    );
    dot.isVisible = false;
    dot.material = new StandardMaterial("dotMaterial", scene);

    let hitTestResult: IWebXRHitResult | null = null;
    let scenePlaced = false;

    // Hit-Test-Ergebnisse überwachen
    xrHitTest.onHitTestResultObservable.add((results) => {
      if (results.length && !scenePlaced) {
        hitTestResult = results[0];
        const transformationMatrix = hitTestResult.transformationMatrix;

        // Position und Rotation aus der TransformationMatrix extrahieren
        const position = new Vector3();
        const rotationQuaternion = new Quaternion();
        transformationMatrix.decompose(undefined, rotationQuaternion, position);

        // Dot an der Hit-Test-Position platzieren
        dot.position = position;
        dot.rotationQuaternion = rotationQuaternion;
        dot.isVisible = true;

        console.log("ARFeatures: Hit-Test erfolgreich:", position);
      } else {
        dot.isVisible = false;
        hitTestResult = null; // Reset hitTest wenn keine Ergebnisse vorhanden sind
      }
    });

    // Ereignisbehandlung für Pointer-Down (Touch/Click)
    scene.onPointerDown = async (evt, pickInfo) => {
      if (
        !scenePlaced &&
        hitTestResult &&
        anchors &&
        xr.baseExperience.state === WebXRState.IN_XR
      ) {
        try {
          console.log("ARFeatures: Platzierung ausgelöst.");

          // Anker an der Hit-Test-Position erstellen
          const anchor = await anchors.addAnchorPointUsingHitTestResultAsync(hitTestResult);
          if (!anchor) {
            throw new Error("ARFeatures: Anker konnte nicht erstellt werden.");
          }

          console.log("ARFeatures: Anker erstellt:", anchor);

          // Sichtbarkeit des SzeneParents sicherstellen
          sceneParent.computeWorldMatrix(true);

          scenePlaced = true;

          console.log("ARFeatures: Szene erfolgreich platziert und verankert.");
        } catch (error) {
          console.error("ARFeatures: Fehler beim Platzieren der Szene:", error);
        }
      }
    };

    console.log("ARFeatures: Initialisierung abgeschlossen.");
  } catch (error) {
    console.error("ARFeatures: Fehler während der Initialisierung:", error);
  }
}