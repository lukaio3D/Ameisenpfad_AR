import {
  Scene,
  TransformNode,
  WebXRHitTest,
  WebXRAnchorSystem,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Quaternion,
  Vector3,
  WebXRState,
  IWebXRHitResult,
  PointerEventTypes,
} from "@babylonjs/core";
import { UIManager } from "../Features/UIManager"; // Stellen Sie sicher, dass UIManager korrekt importiert ist

export default async function createARFeatures(
  scene: Scene,
  sceneParent: TransformNode
  // groundToHide: PhotoDome
) {
  const uiManager = UIManager.getInstance();

  // XR Experience erstellen
  const xrHelper = await scene.createDefaultXRExperienceAsync({
    uiOptions: {
      sessionMode: "immersive-ar",
      referenceSpaceType: "local-floor",
    },
    optionalFeatures: ["anchors", "hit-test"],
  });

  // xrHelper.baseExperience.onStateChangedObservable.add((state) => {
  //   if (state === WebXRState.IN_XR) {
  //     groundToHide.setEnabled(false); // Transparent im AR-Modus
  //   } else if (state === WebXRState.NOT_IN_XR) {
  //     groundToHide.setEnabled(true); // Wieder sichtbar, wenn AR-Modus beendet
  //   }
  // });

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

  const hitTest = featuresManager.enableFeature(
    WebXRHitTest,
    "latest"
  ) as WebXRHitTest;
  if (hitTest) {
    uiManager.displayMessage("Hit-Test aktiviert.");
  } else {
    uiManager.displayMessage("Fehler beim Aktivieren des Hit-Tests.");
  }

  const marker = MeshBuilder.CreateBox("marker", { size: 0.1 }, scene);
  let hitTestResult: IWebXRHitResult;

  hitTest.onHitTestResultObservable.add((results) => {
    if (results.length) {
      marker.isVisible = true;
      hitTestResult = results[0];
      hitTestResult.transformationMatrix.decompose(
        undefined,
        marker.rotationQuaternion,
        marker.position
      );
    } else {
      marker.isVisible = false;
    }
  });

  // Neuen Anker mithilfe der Transformation des HitTests erstellen:
  if (anchorSystem) {
    console.log('anchors attached');
    anchorSystem.onAnchorAddedObservable.add(anchor => {
        console.log('attaching', anchor);
        marker.isVisible = true;
        anchor.attachedNode = marker.clone();
        marker.isVisible = false;
    })

    anchorSystem.onAnchorRemovedObservable.add(anchor => {
        console.log('disposing', anchor);
        if (anchor) {
            anchor.attachedNode.dispose();
        }
    });
}

scene.onPointerObservable.add((pointerInfo) => {
  console.log('Pointer event detected');
  if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
    console.log('Pointer down event detected');
    if (hitTest && anchorSystem && xrHelper.baseExperience.state === WebXRState.IN_XR) {
      console.log('Conditions met, adding anchor');
      anchorSystem.addAnchorPointUsingHitTestResultAsync(hitTestResult);
    } else {
      console.log('Conditions not met');
    }
  }
});
}
