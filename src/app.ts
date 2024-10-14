import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, WebXRHitTest, WebXRDomOverlay, ActionManager, ExecuteCodeAction, SceneLoader, appendSceneAsync, PointerEventTypes, WebXRState, SphereBuilder, WebXRPlaneDetector, WebXRFeatureName, IWebXRDepthSensingOptions, WebXRDepthSensing, DirectionalLight, ShadowGenerator, WebXRBackgroundRemover, Quaternion, StandardMaterial, Color3, WebXRAnchorSystem, FreeCamera, CylinderBuilder, CreateCylinder, loadAssetContainerAsync, RecastJSPlugin, TransformNode } from "@babylonjs/core";
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

/*     const model = await SceneLoader.ImportMeshAsync("", "assets/", "240920_AntAnim.glb", scene);
 */    const container = await loadAssetContainerAsync("assets/240920_AntAnim.glb", scene);
        let b = container.meshes[0];
        console.log(container);
        console.log(b);

        let xr = await scene.createDefaultXRExperienceAsync({
            uiOptions: {
                sessionMode: "immersive-ar",
                referenceSpaceType: "local-floor"
            },
            optionalFeatures: true
        });

        const fm = xr.baseExperience.featuresManager;

        const xrTest = fm.enableFeature(WebXRHitTest.Name, "latest") as WebXRHitTest;
        const anchors = fm.enableFeature(WebXRAnchorSystem.Name, 'latest');


        b.rotationQuaternion = new Quaternion();
        // b.isVisible = false;
        shadowGenerator.addShadowCaster(b, true);

        const marker = MeshBuilder.CreateTorus('marker', { diameter: 0.05, thickness: 0.02 });
        marker.isVisible = false;
        marker.rotationQuaternion = new Quaternion();

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

        let modelPlaced = false; // Flag to check if the model is already placed

        if (anchors) {
            console.log('anchors attached');
            (anchors as WebXRAnchorSystem).onAnchorAddedObservable.add(anchor => {
                console.log('attaching', anchor);
                b.isVisible = true;
                const clonedNode = b.clone("mensch", null, true);
                anchor.attachedNode = clonedNode;
                shadowGenerator.addShadowCaster(clonedNode as Mesh, true);
                b.isVisible = false;
            });

            (anchors as WebXRAnchorSystem).onAnchorRemovedObservable.add(anchor => {
                console.log('disposing', anchor);
                if (anchor && anchor.attachedNode) {
                    (anchor.attachedNode as Mesh).isVisible = false;
                    anchor.attachedNode.dispose();
                }
            });
        }

        scene.onPointerDown = (evt, pickInfo) => {
            if (!modelPlaced && hitTest && anchors && xr.baseExperience.state === WebXRState.IN_XR) {
                (anchors as WebXRAnchorSystem).addAnchorPointUsingHitTestResultAsync(hitTest);
                modelPlaced = true; // Set the flag to true after placing the model
            }
        }

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
