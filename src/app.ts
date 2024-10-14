import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, WebXRHitTest, WebXRDomOverlay, ActionManager, ExecuteCodeAction, SceneLoader, appendSceneAsync, PointerEventTypes, WebXRState, SphereBuilder, WebXRPlaneDetector, WebXRFeatureName, IWebXRDepthSensingOptions, WebXRDepthSensing, DirectionalLight, ShadowGenerator, WebXRBackgroundRemover, Quaternion, StandardMaterial, Color3, WebXRAnchorSystem, FreeCamera } from "@babylonjs/core";
import { WebXRDefaultExperience } from '@babylonjs/core/XR/webXRDefaultExperience.js'

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

    var dirLight = new DirectionalLight('light', new Vector3(0, -1, -0.5), scene);
    dirLight.position = new Vector3(0, 5, -5);

    var shadowGenerator = new ShadowGenerator(1024, dirLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    const model = await SceneLoader.ImportMeshAsync("", "assets/", "240920_AntAnim.glb", scene);
    const idleRange = { from: 0, to: 100 }; // Define idleRange with appropriate values

    var xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-ar",
            referenceSpaceType: "local-floor"
        },
        optionalFeatures: true
    });

    const fm = xr.baseExperience.featuresManager;

    const xrTest = fm.enableFeature(WebXRHitTest.Name, "latest") as WebXRHitTest;
    const anchors = fm.enableFeature(WebXRAnchorSystem.Name, 'latest');

    const xrBackgroundRemover = fm.enableFeature(WebXRBackgroundRemover.Name);

    let b = model.meshes[0];//BABYLON.CylinderBuilder.CreateCylinder('cylinder', { diameterBottom: 0.2, diameterTop: 0.4, height: 0.5 });
    b.rotationQuaternion = new Quaternion();
    // b.isVisible = false;
    shadowGenerator.addShadowCaster(b, true);

    const marker = MeshBuilder.CreateTorus('marker', { diameter: 0.10, thickness: 0.01 });
    marker.isVisible = false;
    marker.rotationQuaternion = new Quaternion();

    var skeleton = model.skeletons[0];

    let hitTest;

    b.isVisible = false;

    (xrTest as WebXRHitTest).onHitTestResultObservable.add((results) => {
        if (results.length) {
            marker.isVisible = true;
            hitTest = results[0];
            hitTest.transformationMatrix.decompose(undefined, b.rotationQuaternion, b.position);
            hitTest.transformationMatrix.decompose(undefined, marker.rotationQuaternion, marker.position);
        } else {
            marker.isVisible = false;
            hitTest = undefined;
        }
    });
    const mat1 = new StandardMaterial('1', scene);
    mat1.diffuseColor = Color3.Red();
    const mat2 = new StandardMaterial('1', scene);
    mat2.diffuseColor = Color3.Blue();

    if (anchors) {
        console.log('anchors attached');
        (anchors as WebXRAnchorSystem).onAnchorAddedObservable.add(anchor => {
            console.log('attaching', anchor);
            b.isVisible = true;
            anchor.attachedNode = b.clone("mensch", null, true);
            (anchor.attachedNode as Mesh).skeleton = skeleton.clone('skelet');
            shadowGenerator.addShadowCaster(anchor.attachedNode as Mesh, true);
        });

        (anchors as WebXRAnchorSystem).onAnchorRemovedObservable.add(anchor => {
            console.log('disposing', anchor);
            if (anchor) {
                (anchor.attachedNode as Mesh).isVisible = false;
                anchor.attachedNode.dispose();
            }
        });
    }

    scene.onPointerDown = (evt, pickInfo) => {
        if (hitTest && anchors && xr.baseExperience.state === WebXRState.IN_XR) {
            (anchors as WebXRAnchorSystem).addAnchorPointUsingHitTestResultAsync(hitTest);
        }
    }

        // run the main render loop
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}
new App();