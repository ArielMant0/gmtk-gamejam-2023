import { AdvancedDynamicTexture, StackPanel, Rectangle, TextBlock, Control, Button } from "@babylonjs/gui";
import { QuestItemType, QuestItemTypeArray, questItemTypeToString } from "./core/enums";
import { Events } from "./core/events";
import { Logic } from "./core/logic";

export default class Inventory {

    private _ui = new Map<QuestItemType, TextBlock>();
    private _money;

    constructor() {
        Events.on("inventory:add", (data: any) => {
            Logic.addToItemAmount(data.questItem.item, data.questItem.amount)
            this.updateItem(data.questItem.item)
            if (data.rewardItem && data.rewardItem.item === QuestItemType.MONEY) {
                Logic.addMoney(-data.rewardItem.amount)
                this.updateMoney();
            }
        })
    }

    public updateItem(item: QuestItemType) {
        if (this._ui.has(item)) {
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
        stack.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        stack.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

        QuestItemTypeArray.forEach(nr => {
            const item = QuestItemType[nr]
            const name = questItemTypeToString(item, 2);

            const r = new StackPanel()
            r.width = "100px";
            r.height = "100px";
            r.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            r.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

            const b = Button.CreateImageOnlyButton(name, "mushroom.png");
            b.color = "white";
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

       this._money = new TextBlock("Money", "" + Logic.money + " " + questItemTypeToString(QuestItemType.MONEY, Logic.money))
       this._money.color = "white";
       this._money.fontSize = "24px";
       this._money.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
       this._money.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
       this._money.resizeToFit = true;
       this._money.paddingRightInPixels = 15;
       this._money.paddingBottomInPixels = 5;

       rect.addControl(stack);
       rect.addControl(this._money)
       gui.addControl(rect);
    }
}
