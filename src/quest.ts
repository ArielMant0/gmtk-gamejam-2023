import QuestItem from "./quest-item";
import { v4 as uuid } from 'uuid';

export default class Quest {

    private _id: string;

    public items: Array<QuestItem> = [];
    public rewards: Array<QuestItem> = [];

    public duration: number = 1;

    constructor(items: Array<QuestItem>, rewards: Array<QuestItem>) {
        this._id = uuid();
        this.items = items;
        this.rewards = rewards;
    }
}
