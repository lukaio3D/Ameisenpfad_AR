import { SphereBuilder, WebXRAnchorSystem, WebXRHitTest, WebXRState } from "@babylonjs/core";

    export default async function createARFeatures(scene) {
    
    // AR Setup
    let xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
          sessionMode: "immersive-ar",
          referenceSpaceType: "local-floor",
        },
        optionalFeatures: true,
      });
  
      const fm = xr.baseExperience.featuresManager;
  
      const xrTest = fm.enableFeature(WebXRHitTest, "latest") as WebXRHitTest;
      const anchors = fm.enableFeature(
        WebXRAnchorSystem,
        "latest"
      ) as WebXRAnchorSystem;
  
      // // a dot to show in the found position
      // const dot = SphereBuilder.CreateSphere(
      //   "dot",
      //   {
      //     diameter: 0.05,
      //   },
      //   scene
      // );
  
      // let hitTest;
      // let antToBePlaced = true;
  
      // dot.isVisible = false;
  
      // xrTest.onHitTestResultObservable.add((results) => {
      //   if (results.length && antToBePlaced) {
      //     hitTest = results[0];
      //     ant.isVisible = true;
      //     results[0].transformationMatrix.decompose(
      //       undefined,
      //       ant.rotationQuaternion,
      //       ant.position
      //     );
      //   } else {
      //     ant.isVisible = false;
      //     hitTest = null; // Reset hitTest if no results
      //   }
      // });
  
      // scene.onPointerDown = (evt, pickInfo) => {
      //   if (
      //     antToBePlaced &&
      //     hitTest &&
      //     anchors &&
      //     xr.baseExperience.state === WebXRState.IN_XR
      //   ) {
      //     anchors.addAnchorPointUsingHitTestResultAsync(hitTest);
      //     antToBePlaced = false;
      //   }
      //   if(!antToBePlaced && pickInfo.pickedMesh === ant) {
      //     console.log("start Animation");
      //     if(!antAnim.isPlaying) {
      //     antAnim.start(true);
      //   } else {
      //     console.log("stop Animation");
      //     antAnim.stop(true);
      //   }
      // }}
      };