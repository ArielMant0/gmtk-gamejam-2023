import QuestItem from "./quest-item";

export default class Quest {

    public items: Array<QuestItem> = [];
    public rewards: Array<QuestItem> = [];

    public duration: number = 1;

    constructor(items: Array<QuestItem>, rewards: Array<QuestItem>) {
        this.items = items;
        this.rewards = rewards;
    }
}
