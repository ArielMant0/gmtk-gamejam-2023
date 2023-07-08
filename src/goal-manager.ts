import { Chance } from "chance";
import { QuestItemType, QuestStatus } from "./core/enums";
import { Events } from "./core/events";
import { IngameTime } from "./core/game-time";
import { Logic } from "./core/logic";
import PlayerGoal from "./player-goal";
import { AdvancedDynamicTexture, TextBlock, Rectangle, Button, Image } from "@babylonjs/gui";

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

        Events.on("gametime:update", (time: number) => {
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
        this._goals.forEach((goal, i) => {
            if (goal.status === QuestStatus.FAILURE) {
                fail[i] = true;
            }
        })

        if (Object.keys(fail).length > 0) {
            this._goals = this._goals.filter((_, i) => !fail[i])
            this._lastGenTime = IngameTime.getTime();
        }
    }

    private _dismissGoal(index: number) {
        if (index >= 0 && index < this._goals.length) {
            this._goals.splice(index, 1)
            this.updateGUI();
        }
    }

    private _collectGoal(index: number) {
        if (index >= 0 && index < this._goals.length) {
            const goal = this._goals.splice(index, 1)[0];
            Events.emit("goal:success", goal)
            this.updateGUI();
        }
    }

    public addGUI(gui: AdvancedDynamicTexture) {
        this._ui = gui;

        const mainIcon = this._ui.getControlByName("GoalImage") as Image
        mainIcon.source = "icons/trophy-cup.png"

        for (let i = 0; i < TARGET_NUM_GOALS; ++i) {
            const cancel =  this._ui.getControlByName("GoalCancel"+i) as Button
            cancel.onPointerClickObservable.add(() => this._dismissGoal(i))

            const collect =  this._ui.getControlByName("GoalCollect"+i) as Button
            collect.onPointerClickObservable.add(() => this._collectGoal(i))
        }
        this.updateGUI();
    }

    public updateGUI() {

        const updateGoal = (index: number) => {

            if (index < this._goals.length) {
                const rect = this._ui.getControlByName("Goal"+index) as Rectangle
                rect.isVisible = true;

                const goal = this._goals[index];
                const goalItem = goal.items[0];
                const goalReward = goal.rewards[0];

                const item = this._ui.getControlByName("GoalItem"+index) as TextBlock
                item.text = `${Logic.getItemAmount(goalItem.item as QuestItemType)} / ${goalItem.amount} ${goalItem.toItemString()}`

                const reward = this._ui.getControlByName("GoalReward"+index) as TextBlock
                reward.text = `Reward: ${goalReward.amount} ${goalReward.toItemString()}`

                const time = this._ui.getControlByName("GoalTimeLeft"+index) as TextBlock
                time.text = goal.deadline === null ? "Time Left: unlimited" : `Time Left: ${goal.timeLeftInDays} d ${goal.timeLeftInHours} h`

                const collect =  this._ui.getControlByName("GoalCollect"+index) as Button
                collect.isEnabled = goal.status === QuestStatus.SUCCESS;
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
