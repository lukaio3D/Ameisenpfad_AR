import { UIManager } from "./UIManager";

export function GameLogic() {
  const uiManager = UIManager.getInstance();

  // Dialogzeile erstellen
  uiManager.dialogzeile.text = `Ich bin ein Textblock`;

  // Timer erstellen in Sekunden
  let countDown: number = 600;

  let timer = setInterval(() => {
    // Game Over
    if (countDown === 0) {
      uiManager.dialogzeile.text = `Game Over`;
      clearInterval(timer);
    }

    // Timer aktualisieren
    let minutes: string = Math.floor(countDown / 60).toString();
    let seconds: string;

    if (countDown % 60 < 10) {
      seconds = "0" + (countDown % 60).toString();
    } else {
      seconds = (countDown % 60).toString();
    }
    uiManager.timer.text = minutes + ":" + seconds;
    countDown = countDown - 1;
  }, 1000);
}
