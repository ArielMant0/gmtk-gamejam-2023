import { GameTime, IngameTime } from "./core/game-time";
import { NPCB } from "./core/npc-balancing";
import NPC from "./npc";
import QuestItem from "./quest-item";

export default class Quest {

    public items: Array<QuestItem> = [];
    public rewards: Array<QuestItem> = [];

    public duration: number;
    private _start: number;

    constructor(items: Array<QuestItem>, rewards: Array<QuestItem>, duration = 24, start = 0) {
        this.items = items;
        this.rewards = rewards;
        this.duration = duration;
        this._start = start;
    }

    public clone() {
        return new Quest(
            this.items.map(d => d.clone()),
            this.rewards.map(d => d.clone()),
            this.duration,
            this._start
        );
    }

    public get timeLeft() {
        return (this._start + this.duration) - IngameTime.getTime();
    }

    public get timeLeftInDays() {
        return GameTime.durationInDays(this.timeLeft)
    }

    public get timeLeftInHours() {
        return GameTime.durationInHours(this.timeLeft)
    }

    public start() {
        this._start = IngameTime.getTime();
    }

    public calculateDuration(npc: NPC) {
        this.duration = NPCB.getQuestDuration(npc, this);
    }
}
