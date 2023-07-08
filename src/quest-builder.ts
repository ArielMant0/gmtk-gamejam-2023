import { AdvancedDynamicTexture, StackPanel, Rectangle, TextBlock, InputText, Control, Button } from "@babylonjs/gui";
import { QuestItem, questItemToString } from "./core/enums";
import { Events } from "./core/events";
import { Logic } from "./core/logic";

export default class QuestBuilder {

    public questAmount: number = 1;
    public questItem: QuestItem | null;

    private _gui;

    public rewardAmount: number = 100;
    public rewardItem: QuestItem | null;

    private _selectItem = 0;

    constructor(amountQ=1, itemQ=null, amountR=100, itemR=QuestItem.MONEY) {
        this.questAmount = amountQ;
        this.questItem = itemQ;
        this.rewardAmount = amountR;
        this.rewardItem = itemR;
        Events.on("questbuilder:add", (item: QuestItem) => {
            if (this._selectItem === 1) {
                this.setQuestItem(item)
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
        this.questAmount = this._validateNumber(amount);
        this.updateGUI();
    }

    public setQuestItem(item: QuestItem) {
        this.questItem = item;
        this.updateGUI();
    }

    public reset() {
        this.questItem = null;
        this.questAmount = 1;
        this.rewardItem = QuestItem.MONEY;
        this.rewardAmount = 100;
        this.updateGUI();
    }

    public setRewardAmount(amount: number | string) {
        this.rewardAmount = this._validateNumber(amount);
        this.updateGUI();
    }

    public setRewardItem(item: QuestItem) {
        this.rewardItem = item;
        this.updateGUI();
    }

    public async addGUI(gui: AdvancedDynamicTexture) {

        this._gui = gui;

        const amountQ = gui.getControlByName("QuestAmount") as InputText
        amountQ.autoStretchWidth = true;
        amountQ.text = ""+this.questAmount;
        amountQ.onTextChangedObservable.add(() => {
            this.setQuestAmount(amountQ.text)
            amountQ.text = ""+this.questAmount;
        });

        const buttonQ = gui.getControlByName("QuestItem") as Button
        buttonQ.adaptWidthToChildren = true;
        if (buttonQ.textBlock?.text) {
            buttonQ.textBlock.text = questItemToString(this.questItem, this.questAmount);
        }
        buttonQ.onPointerDownObservable.add(() => this._selectItem = 1);

        const amountR = gui.getControlByName("RewardAmount") as InputText
        amountR.autoStretchWidth = true;
        amountR.text = ""+this.rewardAmount;
        amountR.onTextChangedObservable.add(() => {
            this.setRewardAmount(amountR.text)
            amountR.text = ""+this.rewardAmount;
        });

        const buttonR = gui.getControlByName("RewardItem") as Button
        buttonR.adaptWidthToChildren = true;
        if (buttonR.textBlock?.text) {
            buttonR.textBlock.text = questItemToString(this.rewardItem, this.rewardAmount);
        }
        buttonR.onPointerDownObservable.add(() => this._selectItem = 2);

        const okay = gui.getControlByName("Confirm") as Button
        okay.onPointerClickObservable.add(() => {
            if (this.questItem !== null && Logic.checkMoney(this.rewardAmount)) {
                Events.emit("inventory:add", {
                    item: this.questItem,
                    amount: this.questAmount,
                    cost: this.rewardAmount
                })
                this.reset();
            }
        })
    }

    public updateGUI() {
        const amountQ = this._gui.getControlByName("QuestAmount") as InputText
        amountQ.text = ""+this.questAmount;

        const buttonQ = this._gui.getControlByName("QuestItem") as Button
        if (buttonQ.textBlock?.text) {
            buttonQ.textBlock.text = questItemToString(this.questItem, this.questAmount);
        }

        const amountR = this._gui.getControlByName("RewardAmount") as InputText
        amountR.text = ""+this.rewardAmount;

        const buttonR = this._gui.getControlByName("RewardItem") as Button
        if (buttonR.textBlock?.text) {
            buttonR.textBlock.text = questItemToString(this.rewardItem, this.rewardAmount);
        }
    }

}
