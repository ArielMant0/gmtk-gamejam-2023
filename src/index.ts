import App from "./app"
import { GameState } from "./core/enums";
import GameScene from "./scenes/game-scene";
import LoadScene from "./scenes/load-scene";
import LoseScene from "./scenes/lose-scene";
import PauseScene from "./scenes/pause-scene";
import WinScene from "./scenes/win-scene";

window.addEventListener("load", function() {

    const app = new App();

    const load = new LoadScene(GameState.LOAD, app.engine);
    const pause = new PauseScene(GameState.PAUSE, app.engine);
    const game = new GameScene(GameState.GAME, app.engine);
    const lose = new LoseScene(GameState.LOSE, app.engine);
    const win = new WinScene(GameState.WIN, app.engine);

    app.registerScene(GameState.LOAD, load);
    app.registerScene(GameState.PAUSE, pause);
    app.registerScene(GameState.GAME, game);
    app.registerScene(GameState.LOSE, lose);
    app.registerScene(GameState.WIN, win);

    app.start();
})
