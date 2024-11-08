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
  TransformNode,
  RecastJSPlugin,
} from "@babylonjs/core";
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience.js";
import Recast from "recast-detour";
import { Inspector } from "@babylonjs/inspector";

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
    ant.scaling = new Vector3(2, 2, 2);

    const antAnim = scene.getAnimationGroupByName("Armature Ant");
    antAnim.stop(true);

    //Navmesh Setup
    let recast = await Recast();
    let navigationPlugin = new RecastJSPlugin();

    const groundMesh = MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      scene
    );

    const navParameters = {
      cs: 0.2,
      ch: 0.2,
      walkableSlopeAngle: 35,
      walkableHeight: 1,
      walkableClimb: 1,
      walkableRadius: 1,
      maxEdgeLen: 12,
      maxSimplificationError: 1.3,
      minRegionArea: 8,
      mergeRegionArea: 20,
      maxVertsPerPoly: 6,
      detailSampleDist: 6,
      detailSampleMaxError: 1,
    };

    navigationPlugin.createNavMesh([groundMesh], navParameters);

    var navmeshdebug = navigationPlugin.createDebugNavMesh(scene);
    navmeshdebug.position = new Vector3(0, 0.01, 0);

    var matdebug = new StandardMaterial("matdebug", scene);
    matdebug.diffuseColor = new Color3(0.1, 0.2, 1);
    matdebug.alpha = 0.2;
    navmeshdebug.material = matdebug;

    // crowd
    var crowd = navigationPlugin.createCrowd(10, 1, scene);
    let antTransform = new TransformNode("antTransform", scene);
    ant.parent = antTransform;
    var agentParams = {
      radius: 0.1,
      height: 0.2,
      maxAcceleration: 4.0,
      maxSpeed: 1.0,
      collisionQueryRange: 0.5,
      pathOptimizationRange: 0.0,
      separationWeight: 1.0,
    };
    let endPoint = new Vector3(-3, 3, 3);

    const agentIndex = crowd.addAgent(new Vector3(0, 0, 0), agentParams, antTransform);
    crowd.agentGoto(agentIndex, navigationPlugin.getClosestPoint(endPoint)); 

    // AR Setup
    let xr = await scene.createDefaultXRExperienceAsync({
      uiOptions: {
        sessionMode: "immersive-ar",
        referenceSpaceType: "local-floor",
      },
      optionalFeatures: true,
    });

    // const fm = xr.baseExperience.featuresManager;

    // const xrTest = fm.enableFeature(WebXRHitTest, "latest") as WebXRHitTest;
    // const anchors = fm.enableFeature(
    //   WebXRAnchorSystem,
    //   "latest"
    // ) as WebXRAnchorSystem;

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
    // ant.isVisible = false;

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
    // }};

    Inspector.Show(scene, {
      embedMode: true,
    });

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
