import { AdvancedDynamicTexture, StackPanel, Rectangle, TextBlock, Control, Button, Image } from "@babylonjs/gui";
import { QuestItemType, QuestItemTypeArray, questItemTypeIcon, questItemTypeToString } from "./core/enums";
import { Events } from "./core/events";
import { Logic } from "./core/logic";
import PlayerGoal from "./player-goal";
import QuestItem from "./quest-item";

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

        const rect = new Rectangle();
        rect.width = 0.95;
        rect.height = "100px";
        rect.top = "-25px";
        rect.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        rect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

        const stack = new StackPanel();
        stack.isVertical = false;
        stack.width = 1;
        stack.adaptHeightToChildren = true;
        stack.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        stack.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

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
            b.onPointerClickObservable.add(() => Events.emit("questbuilder:add", item));
            r.addControl(b);

            const amount = Logic.getItemAmount(item);
            const t = new TextBlock(name+"text", ""+amount);
            t.color = "white";
            t.fontSize = "12px";
            t.height = "24px";
            t.paddingTopInPixels = 5;
            this._ui.set(item, t);
            r.addControl(t);

            stack.addControl(r);
        })

        const mStack = new StackPanel("MoneyContainer")
        mStack.isVertical = true;
        // mStack.top = "-25px"
        mStack.background = "black"
        mStack.adaptWidthToChildren = true;
        mStack.adaptHeightToChildren = true;
        mStack.paddingRightInPixels = 15;
        mStack.paddingBottomInPixels = 15;
        mStack.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        mStack.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        mStack.zIndex = 1;

        const mImage = new Image("MoneyIcon", questItemTypeIcon(QuestItemType.MONEY));
        mImage.width = "128px";
        mImage.height = "128px";
        mImage.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        mImage.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        mStack.addControl(mImage)

        this._money = new TextBlock("MoneyText", "" + Logic.money + " " + questItemTypeToString(QuestItemType.MONEY, Logic.money))
        this._money.color = "white";
        this._money.fontSize = "24px";
        this._money.height = "40px";
        this._money.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this._money.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        mStack.addControl(this._money)

        rect.addControl(stack);
        gui.addControl(rect);
        gui.addControl(mStack)
    }
}
