import { Chance } from "chance";
import { QuestItemType, QuestStatus } from "./core/enums";
import { Events } from "./core/events";
import { IngameTime } from "./core/game-time";
import { Logic } from "./core/logic";
import PlayerGoal from "./player-goal";
import { AdvancedDynamicTexture, TextBlock, Rectangle } from "@babylonjs/gui";

const TARGET_NUM_GOALS = 3;
const MIN_GENERATION_WAIT_TIME = 5;
const GENERATION_PROB = 90;

const chance = new Chance();

export default class GoalManager {

    private _goals: Array<PlayerGoal> = [];

    private _lastGenTime: number = 0;
    private _ui;

    constructor() {
        this._goals.push(PlayerGoal.createRandom());
        this._goals.push(PlayerGoal.createRandom());
        this._goals.push(PlayerGoal.createRandom());
        this._sort();

        Events.on("gametime:change", (time: number) => {
            this._checkGoals();
            this._sort();
            this.updateGUI()

            if (this._goals.length < TARGET_NUM_GOALS &&
                time - this._lastGenTime >= MIN_GENERATION_WAIT_TIME &&
                chance.bool({ likelihood: GENERATION_PROB })
            ) {
                this._goals.push(PlayerGoal.createRandom());
                this._lastGenTime = IngameTime.getTime();
            }
        })

        Events.on("inventory:add", this.updateGUI.bind(this));

        this._lastGenTime = IngameTime.getTime();
    }

    private _sort() {
        this._goals.sort((a, b) => a.timeLeft - b.timeLeft)
    }

    private _checkGoals() {
        const fail = {};
        const success = {};
        this._goals.forEach((goal, i) => {
            if (goal.status === QuestStatus.FAILURE) {
                fail[i] = true;
            }
            if (goal.status === QuestStatus.SUCCESS) {
                success[i] = true;
            }
        })

        Object.keys(success).forEach(index => {
            Events.emit("goal:success", this._goals[index]);
        });

        if (Object.keys(fail).length > 0 || Object.keys(success).length > 0) {
            this._goals = this._goals.filter((_, i) => !fail[i] && !success[i])
            this._lastGenTime = IngameTime.getTime();
        }
    }

    public addGUI(gui: AdvancedDynamicTexture) {
        this._ui = gui;
        this.updateGUI();
    }

    public updateGUI() {

        const updateGoal = (index: number) => {

            if (index < this._goals.length) {
                const rect = this._ui.getControlByName("Goal"+index) as Rectangle
                rect.isVisible = true;

                const goal = this._goals[index];
                const goalItem = goal.items[0];
                const item = this._ui.getControlByName("GoalItem"+index) as TextBlock
                item.text = `${Logic.getItemAmount(goalItem.item as QuestItemType)} / ${goalItem.amount} ${goalItem.toItemString()}`

                const time = this._ui.getControlByName("GoalTimeLeft"+index) as TextBlock
                time.text = goal.deadline === null ? "Time Left: unlimited" : `Time Left: ${goal.timeLeftInDays} d ${goal.timeLeftInHours} h`
            } else {
                const rect = this._ui.getControlByName("Goal"+index) as Rectangle
                rect.isVisible = false;
            }
        };

        for (let i = 0; i < TARGET_NUM_GOALS; ++i) {
            updateGoal(i)
        }
    }
}
