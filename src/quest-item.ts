import { QuestItemType, questItemTypeToString } from "./core/enums";

export default class QuestItem {

    public item: QuestItemType | null;
    public amount: number;

    constructor(item: QuestItemType | null, amount: number) {
        this.item = item;
        this.amount = Math.max(0, Math.round(amount));
    }

    public clone() {
        return new QuestItem(this.item, this.amount);
    }

    public setAmount(amount: number) {
        this.amount = Math.max(0, Math.round(amount));
    }

    public setItem(item: QuestItemType | null) {
        this.item = item;
    }

    public toItemString() {
        return questItemTypeToString(this.item, this.amount)
    }
}
