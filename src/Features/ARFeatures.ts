import {
  Scene,
  TransformNode,
  WebXRDefaultExperience,
  WebXRAnchorSystem,
  WebXRHitTest,
  WebXRState,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  PointerEventTypes,
  IWebXRHitResult,
  Mesh,
  WebXRDomOverlay,
} from "@babylonjs/core";
import { UIManager } from "../Features/UIManager";

export default async function createARFeatures(scene: Scene) {

  let xrHelper: WebXRDefaultExperience;
  try {
    xrHelper = await scene.createDefaultXRExperienceAsync({
      uiOptions: {
          sessionMode: "immersive-ar",
          referenceSpaceType: "local-floor"
      },
      optionalFeatures: true
  });
    await createDOMOverlay();
    await xrHelper.baseExperience.enterXRAsync("immersive-ar", "local-floor");
    console.log("AR-Session gestartet!");
  } catch (error) {
    console.error("Fehler in createARFeatures:", error);
    return;
  }

  async function createDOMOverlay() {
    const featuresManager = xrHelper.baseExperience.featuresManager;
    const domOverlayFeature = featuresManager.enableFeature(
      WebXRDomOverlay,
      "latest",
      { element: "#overlay" },
      undefined,
      false
    );

  }

  // // Anchor-System
  // const anchorSystem = xrHelper.baseExperience.featuresManager.enableFeature(
  //   WebXRAnchorSystem,
  //   "latest"
  // ) as WebXRAnchorSystem;

  // if (anchorSystem) {
  //   uiManager.displayMessage("Anchor-System aktiviert.");
  //   anchorSystem.onAnchorAddedObservable.add((anchor) => {
  //     console.log("Anker hinzugefügt:", anchor);
  //     const markerClone = marker.clone("markerClone");
  //     markerClone.isVisible = true;
  //     anchor.attachedNode = markerClone;
  //     marker.isVisible = false;
  //   });

  //   anchorSystem.onAnchorRemovedObservable.add((anchor) => {
  //     console.log("Anker entfernt:", anchor);
  //     if (anchor && anchor.attachedNode) {
  //       anchor.attachedNode.dispose();
  //     }
  //   });
  // } else {
  //   uiManager.displayMessage("Fehler beim Aktivieren des Anchor-Systems.");
  // }

  // // Hit-Test
  // const hitTest = xrHelper.baseExperience.featuresManager.enableFeature(
  //   WebXRHitTest,
  //   "latest"
  // ) as WebXRHitTest;

  // const marker = MeshBuilder.CreateBox("marker", { size: 0.1 }, scene);
  // marker.isVisible = false;
  // let hitTestResult: IWebXRHitResult;
  // let anchorCreated = false;

  // if (hitTest) {
  //   uiManager.displayMessage("Hit-Test aktiviert.");

  //   // Live-Marker für den aktuellen HitTest
  //   hitTest.onHitTestResultObservable.add((results) => {
  //     if (results.length && !anchorCreated) {
  //       marker.isVisible = true;
  //       hitTestResult = results[0];
  //       hitTestResult.transformationMatrix.decompose(
  //         undefined,
  //         marker.rotationQuaternion,
  //         marker.position
  //       );
  //     } else {
  //       marker.isVisible = false;
  //     }
  //   });

  //   // Anker über HitTest erzeugen
  //   scene.onPointerObservable.add((pointerInfo) => {
  //     if (pointerInfo.type === PointerEventTypes.POINTERDOWN && !anchorCreated) {
  //       if (hitTestResult && anchorSystem && xrHelper.baseExperience.state === WebXRState.IN_XR) {
  //         // Marker sofort unsichtbar machen und Flagge setzen
  //         marker.isVisible = false;
  //         anchorCreated = true;

  //         anchorSystem.addAnchorPointUsingHitTestResultAsync(hitTestResult).then((anchor) => {
  //           if (anchor) {
  //             console.log("Anker erstellt:", anchor);
  //             const markerClone = marker.clone("markerClone");
  //             markerClone.isVisible = true;
  //             anchor.attachedNode = markerClone;
  //           }
  //         }).catch((error) => {
  //           console.error("Fehler beim Hinzufügen des Ankers:", error);
  //           // Falls ein Fehler auftritt, Flagge zurücksetzen
  //           anchorCreated = false;
  //         });
  //       }
  //     }
  //   });
  // } else {
  //   uiManager.displayMessage("Fehler beim Aktivieren des Hit-Tests.");
  // }
}
