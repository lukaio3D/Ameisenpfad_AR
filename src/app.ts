import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  WebXRHitTest,
  WebXRDomOverlay,
  ActionManager,
  ExecuteCodeAction,
  SceneLoader,
  appendSceneAsync,
  PointerEventTypes,
  WebXRState,
  SphereBuilder,
  WebXRPlaneDetector,
  WebXRFeatureName,
  IWebXRDepthSensingOptions,
  WebXRDepthSensing,
  DirectionalLight,
  ShadowGenerator,
  WebXRBackgroundRemover,
  Quaternion,
  StandardMaterial,
  Color3,
  WebXRAnchorSystem,
  FreeCamera,
  CylinderBuilder,
  CreateCylinder,
  loadAssetContainerAsync,
  RecastJSPlugin,
  TransformNode,
} from "@babylonjs/core";
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience.js";

class App {
  constructor() {
    this.initialize();
  }

  async initialize() {
    // create the canvas html element and attach it to the webpage
    var canvas = document.createElement("canvas");
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.id = "gameCanvas";
    document.body.appendChild(canvas);

    // initialize babylon scene and engine
    var engine = new Engine(canvas, true);
    var scene = new Scene(engine);

    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new Scene(engine);

    // This creates and positions a free camera (non-mesh)
    var camera = new FreeCamera("camera1", new Vector3(0, 1, -5), scene);

    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    var dirLight = new DirectionalLight(
      "light",
      new Vector3(0, -1, -0.5),
      scene
    );
    dirLight.position = new Vector3(0, 5, -5);

    // const model = await SceneLoader.ImportMeshAsync(
    //   "",
    //   "assets/",
    //   "240920_AntAnim.glb",
    //   scene
    // );
    const container = await loadAssetContainerAsync(
      "assets/240920_AntAnim.glb",
      scene
    );
    container.addAllToScene();
    const ant = container.meshes[0];
    ant.isVisible = false;
    ant.scaling = new Vector3(2, 2, 2);
    console.log(ant);

    const antAnim = scene.getAnimationGroupByName("Armature Ant");
    antAnim.stop(true);

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

    // a dot to show in the found position
    const dot = SphereBuilder.CreateSphere(
      "dot",
      {
        diameter: 0.05,
      },
      scene
    );

    let hitTest;
    let hitTestObserver;
    let antToBePlaced = true;

    dot.isVisible = false;
    ant.isVisible = false;

    hitTestObserver = xrTest.onHitTestResultObservable.add((results) => {
      if (results.length) {
        hitTest = results[0];
        ant.isVisible = true;
        results[0].transformationMatrix.decompose(
          ant.scaling,
          ant.rotationQuaternion,
          ant.position
        );
      } else {
        ant.isVisible = false;
        hitTest = null; // Reset hitTest if no results
      }
    });

    scene.onPointerDown = async (evt, pickInfo) => {
      if (antToBePlaced && hitTest && anchors && xr.baseExperience.state === WebXRState.IN_XR) {
        anchors.addAnchorPointUsingHitTestResultAsync(hitTest);
        // Remove hit test observer
        xrTest.dispose();
        antToBePlaced = false;
      }
    };

    // run the main render loop
    engine.runRenderLoop(() => {
      scene.render();
    });
  }
}
new App();

function createStaticMesh(scene: Scene) {
  throw new Error("Function not implemented.");
}
