import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, WebXRHitTest, WebXRDomOverlay } from "@babylonjs/core";
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
        var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);

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
        const xrTest = fm.enableFeature(WebXRHitTest, "latest");

        // enable dom overlay
        const domOverlayFeature = fm.enableFeature(
            WebXRDomOverlay,
            "latest",
            { element: "#overlay" },
            undefined,
            false
        );

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === 'i') {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                } else {
                    scene.debugLayer.show();
                }
            }
        });

        // run the main render loop
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}
new App();