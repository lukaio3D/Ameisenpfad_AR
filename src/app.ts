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
    canvas.style.width = "70vw";
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

    const container = await loadAssetContainerAsync(
      "assets/240920_AntAnim.glb",
      scene
    );
    container.addAllToScene();
    const antContainer = container.createRootMesh();
    const ant = scene.getMeshByName("Ant");
    ant.rotate(Vector3.Up(), -Math.PI / 2);
    const antAnim = scene.getAnimationGroupByName("Armature Ant");



    // Navmesh Setup
    let recast = await Recast();
    let navigationPlugin = new RecastJSPlugin();

    var staticMesh = createStaticMesh(scene);
    var navmeshParameters = {
        cs: 0.2,
        ch: 0.2,
        walkableSlopeAngle: 90,
        walkableHeight: 1.0,
        walkableClimb: 1,
        walkableRadius: 1,
        maxEdgeLen: 12.,
        maxSimplificationError: 1.3,
        minRegionArea: 8,
        mergeRegionArea: 20,
        maxVertsPerPoly: 6,
        detailSampleDist: 6,
        detailSampleMaxError: 1,
        };

    navigationPlugin.createNavMesh([staticMesh], navmeshParameters);

    var navmeshdebug = navigationPlugin.createDebugNavMesh(scene);
    navmeshdebug.position = new Vector3(0, 0.01, 0);

    var matdebug = new StandardMaterial('matdebug', scene);
    matdebug.diffuseColor = new Color3(0.1, 0.2, 1);
    matdebug.alpha = 0.2;
    navmeshdebug.material = matdebug;
    
    // crowd

    var crowd = navigationPlugin.createCrowd(10, 1, scene);
    let agents = [];
    var i;
    var agentParams = {
        radius: 0.1,
        height: 0.2,
        maxAcceleration: 4.0,
        maxSpeed: 1.0,
        collisionQueryRange: 0.5,
        pathOptimizationRange: 0.0,
        separationWeight: 1.0};
        
    for (i = 0; i <1; i++) {
        var width = 0.20;
        var agentCube = antContainer ;
        var targetCube = MeshBuilder.CreateBox("cube", { size: 0.1, height: 0.1 }, scene);
        var matAgent = new StandardMaterial('mat2', scene);
        var variation = Math.random();
        matAgent.diffuseColor = new Color3(0.4 + variation * 0.6, 0.3, 1.0 - variation * 0.3);
        agentCube.material = matAgent;
        var randomPos = navigationPlugin.getRandomPointAround(new Vector3(-2.0, 0.1, -1.8), 0.5);
        var transform = new TransformNode("transformNode", scene);
        //agentCube.parent = transform;
        var agentIndex = crowd.addAgent(randomPos, agentParams, transform);
        agents.push({idx:agentIndex, trf:transform, mesh:agentCube, target:targetCube});
    }
    
    var startingPoint;
    var currentMesh;
    var pathLine;
    var getGroundPosition = function () {
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY);
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }

    var pointerDown = function (mesh) {
            currentMesh = mesh;
            startingPoint = getGroundPosition();
            if (startingPoint) { // we need to disconnect camera from canvas
                setTimeout(function () {
                    // camera.detachControl();
                }, 0);
                var agents = crowd.getAgents();
                var i;
                for (i=0;i<agents.length;i++) {
                    var randomPos = navigationPlugin.getRandomPointAround(startingPoint, 1.0);
                    crowd.agentGoto(agents[i], navigationPlugin.getClosestPoint(startingPoint));
                }
                var pathPoints = navigationPlugin.computePath(crowd.getAgentPosition(agents[0]), navigationPlugin.getClosestPoint(startingPoint));
                pathLine = MeshBuilder.CreateDashedLines("ribbon", {points: pathPoints, updatable: true, instance: pathLine}, scene);
            }
    }
    
    scene.onPointerObservable.add((pointerInfo) => {      		
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:
                if(pointerInfo.pickInfo.hit) {
                    pointerDown(pointerInfo.pickInfo.pickedMesh)
                }
                break;
                }
                });

    scene.onBeforeRenderObservable.add(()=> {
        var agentCount = agents.length;
        for(let i = 0;i<agentCount;i++)
        {
            var ag = agents[i];
            ag.mesh.position = crowd.getAgentPosition(ag.idx);
            let vel = crowd.getAgentVelocity(ag.idx);
            antAnim.speedRatio = vel.length()*0.9;
            crowd.getAgentNextTargetPathToRef(ag.idx, ag.target.position);
            if (vel.length() > 0.2)
            {
                vel.normalize();
                var desiredRotation = Math.atan2(vel.x, vel.z);
                ag.mesh.rotation.y = ag.mesh.rotation.y + (desiredRotation - ag.mesh.rotation.y ) * 0.05;

            }
        }
    });

    function createStaticMesh(scene) {
      var ground = Mesh.CreateGround("ground1", 6, 6, 2, scene);
  
      // Materials
      var mat1 = new StandardMaterial('mat1', scene);
      mat1.diffuseColor = new Color3(1, 1, 1);
      mat1.alpha = 0;
  
      var mesh = Mesh.MergeMeshes([ground]);
      mesh.material = mat1;
      return mesh;
  }

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

    let hitTest;
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

    // Inspector.Show(scene, {
    // });

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
