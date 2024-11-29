// UIManager.ts
import * as GUI from "@babylonjs/gui";

export class UIManager {
  private static instance: UIManager;
  public advancedTexture: GUI.AdvancedDynamicTexture;
  public dialogzeile: GUI.TextBlock;
  public timer: GUI.TextBlock;
  public healthBar: GUI.Slider;

  private constructor() {
    // AdvancedTexture erstellen
    this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // Dialogzeile erstellen und konfigurieren
    this.dialogzeile = new GUI.TextBlock();
    this.dialogzeile.text = "";
    this.dialogzeile.color = "white";
    this.dialogzeile.fontSize = 16;
    this.dialogzeile.height = "50px";
    this.dialogzeile.width = "100%";
    this.dialogzeile.paddingBottom = "24px";
    this.dialogzeile.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.dialogzeile.textHorizontalAlignment =
      GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

    // TextBlock zur GUI hinzufügen
    this.advancedTexture.addControl(this.dialogzeile);

    // Container erstellen und konfigurieren
    let containerTopLeft = new GUI.Rectangle();
    containerTopLeft.height = "50px";
    containerTopLeft.width = "80px";
    containerTopLeft.thickness = 0; // Rahmen entfernen
    containerTopLeft.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    containerTopLeft.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.advancedTexture.addControl(containerTopLeft);

    // TextBlock zur GUI hinzufügen
    this.advancedTexture.addControl(this.dialogzeile);

    // Dialogzeile erstellen und konfigurieren
    this.timer = new GUI.TextBlock();
    this.timer.text = "0:00";
    this.timer.color = "white";
    this.timer.fontSize = 16;
    this.timer.height = "50px";
    this.timer.width = "100px";

    // TextBlock zur GUI hinzufügen
    containerTopLeft.addControl(this.timer);

    // Container erstellen und konfigurieren
    let containerTopRight = new GUI.Rectangle();
    containerTopRight.height = "50px";
    containerTopRight.width = "110px";
    containerTopRight.thickness = 0; // Rahmen entfernen
    containerTopRight.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    containerTopRight.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.advancedTexture.addControl(containerTopRight);

    // Lebensbalken erstellen und konfigurieren
    this.healthBar = new GUI.Slider();
    this.healthBar.minimum = 0;
    this.healthBar.maximum = 100;
    this.healthBar.color = "green";
    this.healthBar.background = "white";
    this.healthBar.value = 70;
    this.healthBar.height = "16px";
    this.healthBar.width = "80px";
    this.healthBar.displayThumb = false;

    // Lebensbalken zur GUI hinzufügen
    containerTopRight.addControl(this.healthBar);
  }

  // Singleton-Instanz abrufen
  public static getInstance(): UIManager {
    if (!UIManager.instance) {
      UIManager.instance = new UIManager();
    }
    return UIManager.instance;
  }
}
