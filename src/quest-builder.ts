import { AdvancedDynamicTexture, InputText, Button, Rectangle, TextBlock } from "@babylonjs/gui";
import { DialogPhase, QuestItemType } from "./core/enums";
import { Events } from "./core/events";
import { Logic } from "./core/logic";
import QuestItem from "./quest-item";
import SM from './core/sound-manager'

export default class QuestBuilder {

    public questItem: QuestItem;
    public rewardItem: QuestItem;

    private _gui;

    private _dialogPhase = DialogPhase.NONE;

    constructor(itemQ=null, amountQ=1, itemR=QuestItemType.MONEY, amountR=100) {
        this.questItem = new QuestItem(itemQ, amountQ);
        this.rewardItem = new QuestItem(itemR, amountR);

        Events.on("questbuilder:add", this.setQuestItemType.bind(this));

        Events.on("npc:arrive", () => {
            if (this._dialogPhase === DialogPhase.NONE) {
                this._showStartDialog()
            }
        })
        Events.on("npc:quest", this._showEndDialog.bind(this))
    }

    public reset() {
        this._dialogPhase = DialogPhase.NONE;
        if (this._gui) {
            const dialog = this._gui.getControlByName("DialogWindow") as Rectangle;
            dialog.isVisible = false;
            const qb = this._gui.getControlByName("QuestBuilder") as Rectangle;
            qb.isVisible = false;
        }
        this.resetQuest();
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
        Logic.setQuest(this.questItem, this.rewardItem);
        this.updateGUI();
    }

    public setQuestItemType(item: QuestItemType) {
        this.questItem.setItem(item);
        Logic.setQuest(this.questItem, this.rewardItem);
        this.updateGUI();
    }

    public resetQuest() {
        this.questItem.setItem(null);
        this.questItem.setAmount(1);
        this.rewardItem.setItem(QuestItemType.MONEY);
        this.rewardItem.setAmount(100);
        Logic.setQuest(this.questItem, this.rewardItem);
        this.updateGUI();
    }

    public setRewardAmount(amount: number | string) {
        this.rewardItem.setAmount(this._validateNumber(amount));
        Logic.setQuest(this.questItem, this.rewardItem);
        this.updateGUI();
    }

    public setRewardItem(item: QuestItemType) {
        this.rewardItem.setItem(item);
        Logic.setQuest(this.questItem, this.rewardItem);
        this.updateGUI();
    }

    public async addGUI(gui: AdvancedDynamicTexture) {

        this._gui = gui;

        const amountQ = gui.getControlByName("QuestAmount") as InputText
        amountQ.text = ""+this.questItem.amount;
        amountQ.onBlurObservable.add(() => {
            this.setQuestAmount(amountQ.text)
            amountQ.text = ""+this.questItem.amount;
        });

        const buttonQ = gui.getControlByName("QuestItem") as Button
        buttonQ.isReadOnly = true;
        if (buttonQ.textBlock?.text) {
            buttonQ.textBlock.text = this.questItem.toItemString();
        }

        const amountR = gui.getControlByName("RewardAmount") as InputText
        amountR.text = ""+this.rewardItem.amount;
        amountR.onBlurObservable.add(() => {
            this.setRewardAmount(amountR.text)
            amountR.text = ""+this.rewardItem.amount;
        });

        const buttonR = gui.getControlByName("RewardItem") as Button
        buttonR.isReadOnly = true;
        if (buttonR.textBlock?.text) {
            buttonR.textBlock.text = this.rewardItem.toItemString();
        }

        const okay = gui.getControlByName("Confirm") as Button
        okay.onPointerClickObservable.add(() => {
            SM.playSound("click");
            if (this.questItem.item !== null && Logic.checkMoney(this.rewardItem.amount)) {
                Events.emit("quest:assign", {
                    questItem: this.questItem,
                    rewardItem: this.rewardItem,
                })
            }
        })

        const buttonDialog = gui.getControlByName("DialogButton") as Button
        buttonDialog.onPointerClickObservable.add(() => {
            SM.playSound("click");
            if (this._dialogPhase === DialogPhase.START) {
                this._showQuestBuilder()
            } else if (this._dialogPhase === DialogPhase.END) {
                Events.emit("npc:leave")
                this._showStartDialog();
            }
        });
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

    private _showStartDialog() {
        if (Logic.npc !== null) {

            const qb = this._gui.getControlByName("QuestBuilder") as Rectangle;
            qb.isVisible = false;

            const dialog = this._gui.getControlByName("DialogWindow") as Rectangle;

            const speaker = this._gui.getControlByName("DialogSpeaker") as TextBlock
            speaker.text = Logic.npc.name;

            const text = this._gui.getControlByName("DialogText") as TextBlock
            text.textWrapping = true;
            text.text = "Hello, I am an Adventurer! Do you have a quest for me?";

            const buttonDialog = this._gui.getControlByName("DialogButton") as Button
            // @ts-ignore
            buttonDialog.textBlock?.text = "Continue"

            dialog.isVisible = true;
            this._dialogPhase = DialogPhase.START;
        } else {
            const dialog = this._gui.getControlByName("DialogWindow") as Rectangle;
            dialog.isVisible = false;
            const qb = this._gui.getControlByName("QuestBuilder") as Rectangle;
            qb.isVisible = false;
            this._dialogPhase = DialogPhase.NONE;
        }
    }

    private _showQuestBuilder() {
        if (Logic.npc !== null) {

            this.resetQuest();

            const dialog = this._gui.getControlByName("DialogWindow") as Rectangle;
            dialog.isVisible = false;

            const qb = this._gui.getControlByName("QuestBuilder") as Rectangle;
            qb.isVisible = true;
            this._dialogPhase = DialogPhase.QUEST;
        } else {
            const dialog = this._gui.getControlByName("DialogWindow") as Rectangle;
            dialog.isVisible = false;
            const qb = this._gui.getControlByName("QuestBuilder") as Rectangle;
            qb.isVisible = false;
            this._dialogPhase = DialogPhase.NONE;
        }
    }

    private _showEndDialog(accepted: boolean) {
        if (Logic.npc !== null) {

            const qb = this._gui.getControlByName("QuestBuilder") as Rectangle;
            qb.isVisible = false;

            const dialog = this._gui.getControlByName("DialogWindow") as Rectangle;

            const speaker = this._gui.getControlByName("DialogSpeaker") as TextBlock
            speaker.text = Logic.npc.name;
            const text = this._gui.getControlByName("DialogText") as TextBlock
            text.text = accepted ? "Sure, I think I can manage that. See you soon!" : "No way. Bye."

            const buttonDialog = this._gui.getControlByName("DialogButton") as Button
            // @ts-ignore
            buttonDialog.textBlock?.text = "End"

            dialog.isVisible = true;
            this._dialogPhase = DialogPhase.END;
        } else {
            const dialog = this._gui.getControlByName("DialogWindow") as Rectangle;
            dialog.isVisible = false;
            const qb = this._gui.getControlByName("QuestBuilder") as Rectangle;
            qb.isVisible = false;
            this._dialogPhase = DialogPhase.NONE;
        }
    }


}
