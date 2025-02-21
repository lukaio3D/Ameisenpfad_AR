// UIManager.ts
import * as GUI from "@babylonjs/gui";

export class UIManager {
  private static instance: UIManager;
  public healthBar: HTMLProgressElement;
  public collectBar: HTMLProgressElement;
  public winnerScreen: HTMLDivElement;
  public loserScreen: HTMLDivElement;
  public dialogzeile: HTMLParagraphElement;


  private constructor() {
    this.dialogzeile = document.getElementById("dialogzeile") as HTMLParagraphElement;
    this.healthBar = document.getElementById("lebensAnzeige") as HTMLProgressElement;
    this.collectBar = document.getElementById("fruechteAnzeige") as HTMLProgressElement;
    this.winnerScreen = document.getElementById("winnerScreen") as HTMLDivElement;
    this.loserScreen = document.getElementById("loserScreen") as HTMLDivElement;
  }

  // Singleton-Instanz abrufen
  public static getInstance(): UIManager {
    if (!UIManager.instance) {
      UIManager.instance = new UIManager();
    }
    return UIManager.instance;
  }

  // Neue Methode zum Anzeigen von Nachrichten in der Dialogzeile
  public displayMessage(text: string) {
    this.dialogzeile.innerHTML = text;
  }

  public toogleWinnerScreen() {
    this.winnerScreen.style.display = "flex";
  }

  public toogleLoserScreen() {
    this.loserScreen.style.display = "flex";
  }

  public setHealthBar(value: number) {
    this.healthBar.value = value;
  }

  public setFruitBar(value: number) {
    this.collectBar.value = value;
  }
}
