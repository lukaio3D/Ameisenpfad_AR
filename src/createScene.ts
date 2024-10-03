import type { Scene } from "@babylonjs/core/scene";

// Change this import to check other scenes
import { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import { ARScene } from "./scenes/ARScene";

export interface CreateSceneClass {
    createScene: (engine: AbstractEngine, canvas: HTMLCanvasElement) => Promise<Scene>;
    preTasks?: Promise<unknown>[];
}

export interface CreateSceneModule {
    default: CreateSceneClass;
}

export const getSceneModule = (): CreateSceneClass => {
    return new ARScene();
}
