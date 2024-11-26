import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/loaders/glTF";
import createAntCommunicationScene from "./Scenes/9_AntCommunication_Scene";
import { Engine, Scene } from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector";
import createGUI from "./Features/GUI";

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
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new Scene(engine);
    // Instantiate the GUI 
    createGUI();

    // create the scene
   await createAntCommunicationScene(canvas, scene);

    // show the inspector
    Inspector.Show(scene, {overlay: true});

    // run the main render loop
    engine.runRenderLoop(() => {
      scene.render();
    });
  }
}
new App();
