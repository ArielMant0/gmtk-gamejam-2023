import { QuestItemType, QuestItemTypeArray, QuestStatus } from "./core/enums";
import { GameTime, IngameTime } from "./core/game-time";
import { Logic } from "./core/logic";
import { NPCB } from "./core/npc-balancing";
import QuestItem from "./quest-item";
import { Chance } from "chance";

const chance = new Chance();

export default class PlayerGoal {

    public items: Array<QuestItem> = [];
    public rewards: Array<QuestItem> = [];

    public deadline: number | null;

    constructor(items: Array<QuestItem>, rewards: Array<QuestItem>, deadline: number | null = null) {
        this.items = items;
        this.rewards = rewards;
        this.deadline = deadline;
    }

    public get timeLeft() {
        return this.deadline === null ? Infinity : this.deadline - IngameTime.getTime();
    }

    public get timeLeftInDays() {
        return this.deadline === null ? Infinity : GameTime.durationInDays(this.timeLeft)
    }

    public get timeLeftInHours() {
        return this.deadline === null ? Infinity : GameTime.durationInHours(this.timeLeft)
    }

    public get status() {
        const onTime = (this.deadline === null || this.timeLeft >= 0);
        const hasItems = Logic.getItemAmount(this.items[0].item as QuestItemType) >= this.items[0].amount
        return onTime && hasItems ? QuestStatus.SUCCESS : (onTime ? QuestStatus.PENDING : QuestStatus.FAILURE);
    }

    static createRandom() {
        // TODO: change this?
        const numItems = 1;// chance.integer({ min: 1, max: QuestItemTypeArray.length-1 });

        const items = chance.pickset(QuestItemTypeArray.filter(d => d !== "MONEY"), numItems)
            .map(d => new QuestItem(QuestItemType[d], chance.integer({ min: 1, max: 5 })))

        // TODO check if okay
        let deadline: number | null = null;
        const rewards = [new QuestItem(QuestItemType.MONEY, 0)]

        if (items[0].item) {
            if (chance.bool({ likelihood: 66 })) {
                deadline = IngameTime.getTime() +
                NPCB.getItemTime(items[0].item, items[0].amount);
            }

            rewards[0] = new QuestItem(
                QuestItemType.MONEY,
                NPCB.getItemWorth(items[0].item, items[0].amount)
            )
        }

        return new PlayerGoal(items, rewards, deadline)
    }
}
