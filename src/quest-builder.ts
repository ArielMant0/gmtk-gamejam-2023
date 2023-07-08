import { AdvancedDynamicTexture, InputText, Button } from "@babylonjs/gui";
import { QuestItemType } from "./core/enums";
import { Events } from "./core/events";
import { Logic } from "./core/logic";
import QuestItem from "./quest-item";

export default class QuestBuilder {

    public questItem: QuestItem;
    public rewardItem: QuestItem;

    private _gui;

    private _selectItem = 0;

    constructor(itemQ=null, amountQ=1, itemR=QuestItemType.MONEY, amountR=100) {
        this.questItem = new QuestItem(itemQ, amountQ);
        this.rewardItem = new QuestItem(itemR, amountR);
        Events.on("questbuilder:add", (item: QuestItemType) => {
            if (this._selectItem === 1) {
                this.setQuestItemType(item)
                this._selectItem = 0;
            } else if (this._selectItem === 2) {
                this.setRewardItem(item)
                this._selectItem = 0;
            }
        })
    }

    private _validateNumber(number: number | string, minValue: number = 1) {
        if (typeof number === "string") {
            number = Number.parseInt(number)
            if (Number.isNaN(number)) {
                number = minValue;
            }
        }
        return Math.max(minValue, Math.round(number))
    }

    public setQuestAmount(amount: number | string) {
        this.questItem.setAmount(this._validateNumber(amount));
        this.updateGUI();
    }

    public setQuestItemType(item: QuestItemType) {
        this.questItem.setItem(item);
        this.updateGUI();
    }

    public reset() {
        this.questItem.setItem(null);
        this.questItem.setAmount(1);
        this.rewardItem.setItem(QuestItemType.MONEY);
        this.rewardItem.setAmount(100);
        this.updateGUI();
    }

    public setRewardAmount(amount: number | string) {
        this.rewardItem.setAmount(this._validateNumber(amount));
        this.updateGUI();
    }

    public setRewardItem(item: QuestItemType) {
        this.rewardItem.setItem(item);
        this.updateGUI();
    }

    public async addGUI(gui: AdvancedDynamicTexture) {

        this._gui = gui;

        const amountQ = gui.getControlByName("QuestAmount") as InputText
        amountQ.autoStretchWidth = true;
        amountQ.text = ""+this.questItem.amount;
        amountQ.onTextChangedObservable.add(() => {
            this.setQuestAmount(amountQ.text)
            amountQ.text = ""+this.questItem.amount;
        });

        const buttonQ = gui.getControlByName("QuestItem") as Button
        buttonQ.adaptWidthToChildren = true;
        if (buttonQ.textBlock?.text) {
            buttonQ.textBlock.text = this.questItem.toItemString();
        }
        buttonQ.onPointerDownObservable.add(() => this._selectItem = 1);

        const amountR = gui.getControlByName("RewardAmount") as InputText
        amountR.autoStretchWidth = true;
        amountR.text = ""+this.rewardItem.amount;
        amountR.onTextChangedObservable.add(() => {
            this.setRewardAmount(amountR.text)
            amountR.text = ""+this.rewardItem.amount;
        });

        const buttonR = gui.getControlByName("RewardItem") as Button
        buttonR.adaptWidthToChildren = true;
        if (buttonR.textBlock?.text) {
            buttonR.textBlock.text = this.rewardItem.toItemString();
        }
        buttonR.onPointerDownObservable.add(() => this._selectItem = 2);

        const okay = gui.getControlByName("Confirm") as Button
        okay.onPointerClickObservable.add(() => {
            if (this.questItem.item !== null && Logic.checkMoney(this.rewardItem.amount)) {
                Events.emit("inventory:add", {
                    questItem: this.questItem,
                    rewardItem: this.rewardItem
                })
                Events.emit("quest:assign", {
                    questItem: this.questItem,
                    rewardItem: this.rewardItem,
                })
                this.reset();
            }
        })
    }

    public updateGUI() {
        const amountQ = this._gui.getControlByName("QuestAmount") as InputText
        amountQ.text = ""+this.questItem.amount;

        const buttonQ = this._gui.getControlByName("QuestItem") as Button
        if (buttonQ.textBlock?.text) {
            buttonQ.textBlock.text = this.questItem.toItemString();
        }

        const amountR = this._gui.getControlByName("RewardAmount") as InputText
        amountR.text = ""+this.rewardItem.amount;

        const buttonR = this._gui.getControlByName("RewardItem") as Button
        if (buttonR.textBlock?.text) {
            buttonR.textBlock.text = this.rewardItem.toItemString();
        }
    }

}
