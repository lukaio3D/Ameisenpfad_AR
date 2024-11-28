import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/loaders/glTF";
import createAntCommunicationScene from "./Scenes/9_AntCommunication_Scene";
import { Engine, HavokPlugin, Scene } from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector";
import createGUI from "./Features/GUI";
import * as GUI from '@babylonjs/gui'

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
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // let button1 = GUI.Button.CreateSimpleButton("but1", "Click Me");
    // button1.width = "150px"
    // button1.height = "40px";
    // button1.color = "white";
    // button1.cornerRadius = 20;
    // button1.background = "green";
    // button1.onPointerUpObservable.add(function() {
    //     alert("you did it!");
    // });
    // advancedTexture.addControl(button1);

    var text1 = new GUI.TextBlock();
    text1.text = "Ameisen in AR";
    text1.color = "white";
    text1.fontSize = 24;
    text1.height = "50px"; // Höhe des TextBlocks
    text1.width = "100%";  // Breite über den gesamten Bildschirm
    text1.paddingBottom = "24px"; // Abstand zum unteren Rand
    advancedTexture.addControl(text1);    
    text1.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM; // Positioniert den TextBlock am unteren Rand
    text1.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER; // Zentriert den Text innerhalb des TextBlocks

    // create the scene
    await createAntCommunicationScene(canvas, scene);

    // show the inspector
    // Inspector.Show(scene, { overlay: true });

    // run the main render loop
    engine.runRenderLoop(() => {
      scene.render();
    });
  }
}
new App();
