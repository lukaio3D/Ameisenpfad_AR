import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, WebXRHitTest, WebXRDomOverlay, ActionManager, ExecuteCodeAction, SceneLoader, appendSceneAsync, PointerEventTypes, WebXRState, SphereBuilder, WebXRPlaneDetector, WebXRFeatureName, IWebXRDepthSensingOptions, WebXRDepthSensing } from "@babylonjs/core";
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

        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        // Load hero character and play animation
        appendSceneAsync("assets/240920_AntAnim.glb", scene);

        /*                     //Get the Samba animation Group
                            const sambaAnim = scene.getAnimationGroupByName("Armature Ant");
                
                            //Play the Samba animation  
                            sambaAnim.stop(true);
                
                            // Create a simple box
                            const box = MeshBuilder.CreateBox("box", { size: 0.5 }, scene);
                            box.visibility = 0;
                            box.position = new Vector3(1, 0, 0);
                
                            let i = 0;
                            // Add pointer down event to the box
                            box.actionManager = new ActionManager(scene);
                            box.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, function () {
                
                                if (i === 0) {
                                    sambaAnim.start(true, 1.0, sambaAnim.from, sambaAnim.to, false);
                                    i = 1;
                                } else {
                                    sambaAnim.stop(true);
                                    i = 0;
                                }
                            })); */


        const xr = await scene.createDefaultXRExperienceAsync({
            // ask for an ar-session
            uiOptions: {
                sessionMode: "immersive-ar",
                referenceSpaceType: "local-floor"
            },
            optionalFeatures: true,
        });

        const fm = xr.baseExperience.featuresManager;
        const sm = xr.baseExperience.sessionManager;

        // enable hit test
        const hitTest = fm.enableFeature(WebXRHitTest, "latest") as WebXRHitTest;;

        // a dot to show in the found position
        const dot = SphereBuilder.CreateSphere(
            "dot",
            {
                diameter: 0.05,
            },
            scene,
        );
        dot.isVisible = false;
        hitTest.onHitTestResultObservable.add((results) => {
            if (results.length) {
                dot.isVisible = true;
                results[0].transformationMatrix.decompose(dot.scaling, dot.rotationQuaternion, dot.position);
            } else {
                dot.isVisible = false;
            }
        });

/*         // featuresManager from the base webxr experience helper
        const planeDetector = fm.enableFeature(WebXRPlaneDetector, "latest") as WebXRPlaneDetector; */

        const lightEstimationFeature = fm.enableFeature(WebXRFeatureName.LIGHT_ESTIMATION, "latest", {
            createDirectionalLightSource: true,
        });

        // featuresManager from the base webxr experience helper
        const depthSensing = fm.enableFeature(
            WebXRFeatureName.DEPTH_SENSING,
            "latest",
            {
                dataFormatPreference: ["ushort", "float"],
                usagePreference: ["cpu", "gpu"],
            } as IWebXRDepthSensingOptions,
        ) as WebXRDepthSensing;

        // enable dom overlay
        const domOverlayFeature = fm.enableFeature(
            WebXRDomOverlay,
            "latest",
            { element: "#overlay" },
            undefined,
            false
        );



        /*         scene.debugLayer.show(); */

        /*         // hide/show the Inspector
                window.addEventListener("keydown", (ev) => {
                    // Shift+Ctrl+Alt+I
                    if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === 'i') {
                        if (scene.debugLayer.isVisible()) {
                            scene.debugLayer.hide();
                        } else {
                            scene.debugLayer.show();
                        }
                    }
                }); */

        // run the main render loop
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}
new App();