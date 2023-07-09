import { AdvancedDynamicTexture, StackPanel, Rectangle, TextBlock, Control, Button, Image } from "@babylonjs/gui";
import { QuestItemType, QuestItemTypeArray, questItemTypeIcon, questItemTypeToString } from "./core/enums";
import { Events } from "./core/events";
import { Logic } from "./core/logic";
import PlayerGoal from "./player-goal";
import QuestItem from "./quest-item";
import SM from './core/sound-manager';

export default class Inventory {

    private _ui = new Map<QuestItemType, TextBlock>();
    private _money;

    constructor() {
        Events.on("inventory:add", (item: QuestItem) => {
            Logic.addToItemAmount(item.item as QuestItemType, item.amount)
            this.updateItem(item.item as QuestItemType)
        });

        Events.on("inventory:remove", (item: QuestItem) => {
            Logic.addToItemAmount(item.item as QuestItemType, -item.amount)
            this.updateItem(item.item as QuestItemType)
        });

        Events.on("goal:success", (goal: PlayerGoal) => {
            const itemTypeQ = goal.items[0].item as QuestItemType;
            Logic.addToItemAmount(itemTypeQ, -goal.items[0].amount)
            this.updateItem(itemTypeQ)
            const itemTypeR = goal.rewards[0].item as QuestItemType;
            Logic.addToItemAmount(itemTypeR, goal.rewards[0].amount)
            this.updateItem(itemTypeR)
        })
    }

    public reset() {
        this.updateAllItems();
    }

    public updateAllItems() {
        QuestItemTypeArray.forEach(nr => this.updateItem(QuestItemType[nr]))
    }

    public updateItem(item: QuestItemType) {
        if (item === QuestItemType.MONEY) {
            this.updateMoney();
        } else if (this._ui.has(item)) {
            // @ts-ignore
            this._ui.get(item).text = "" + Logic.getItemAmount(item);
        }
    }

    public updateMoney() {
        this._money.text = "" + Logic.money + " " + questItemTypeToString(QuestItemType.MONEY, Logic.money);
    }

    public addGUI(gui: AdvancedDynamicTexture) {

        const parent = gui.getControlByName("InventoryItemParent") as StackPanel;

        QuestItemTypeArray.forEach(nr => {
            const item = QuestItemType[nr]

            if (item === QuestItemType.MONEY) return;

            const name = questItemTypeToString(item, 2);

            const r = new StackPanel()
            r.width = "100px";
            // r.height = "100px";
            r.adaptHeightToChildren = true;
            r.paddingTopInPixels = 5;
            r.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            r.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

            const b = Button.CreateImageOnlyButton(name, questItemTypeIcon(item));
            b.width = "64px";
            b.height = "64px";
            b.paddingLeftInPixels = 5;
            b.onPointerClickObservable.add(() => {
                SM.play("click")
                Events.emit("questbuilder:add", item)
            });
            r.addControl(b);

            const amount = Logic.getItemAmount(item);
            const t = new TextBlock(name+"text", ""+amount);
            t.color = "black";
            t.fontSize = "12px";
            t.height = "24px";
            t.paddingTopInPixels = 5;
            this._ui.set(item, t);
            r.addControl(t);

            parent.addControl(r);
        })

        this._money = gui.getControlByName("MoneyText") as TextBlock;
        this._money.text = "" + Logic.money + " " + questItemTypeToString(QuestItemType.MONEY, Logic.money);

        const coins = gui.getControlByName("MoneyIcon") as Image;
        coins.source = "assets/icons/coins.png"
    }
}
