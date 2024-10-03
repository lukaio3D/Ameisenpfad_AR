import { Scene, FreeCamera, Vector3, HemisphericLight, MeshBuilder } from '@babylonjs/core';
import { CreateSceneClass } from "../createScene";
import { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import { WebXRExperienceHelper } from '@babylonjs/core/XR/webXRExperienceHelper';

export class ARScene implements CreateSceneClass {
    createScene = async (
        engine: AbstractEngine,
        canvas: HTMLCanvasElement
    ): Promise<Scene> => {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine);
        var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
        camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);
        var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
        light.intensity = 0.7;
        var sphere = MeshBuilder.CreateSphere("sphere1", { segments: 16, diameter: 2 }, scene);
        sphere.position.y = 1;

        const env = scene.createDefaultEnvironment();

        // here we add XR support
        const xr = await scene.createDefaultXRExperienceAsync({
            uiOptions: {
                sessionMode: "immersive-ar",
              },
        });

        return scene;
    };
}