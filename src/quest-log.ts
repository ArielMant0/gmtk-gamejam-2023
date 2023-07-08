import { AdvancedDynamicTexture, Control, TextBlock } from "@babylonjs/gui";
import NPC from "./npc";
import Quest from "./quest";
import { Events } from "./core/events";
import { QuestStatus } from "./core/enums";

export default class QuestLog {

    private _ui: AdvancedDynamicTexture;
    private _parent;
    private _template;
    private _count = 1;

    private _map = new Map<string, number>();
    private _npcs = new Map<number, NPC>();

    constructor(ui: AdvancedDynamicTexture, templateId: string, parentId: string) {
        this._ui = ui;
        this._template = ui.getControlByName(templateId);
        this._parent = ui.getControlByName(parentId);
        this._template.isVisible = false;

        Events.on("gametime:update", (time: number) => {
            // TODO: sort quests
            // this._sort();
            this._checkQuests(false);
            this._updateGUI()
        })

    }

    private get next() {
        const val = this._count;
        this._count = this._count < Number.MAX_SAFE_INTEGER ? this._count+1 : 1;
        return val;
    }

    public addQuest(npc: NPC) {
        const index = this.next;
        this._map.set(npc.id, index)
        this._npcs.set(index, npc)
        this._updateGUI();
    }

    public removeQuest(id: string, update=true) {
        const index = this._map.get(id);
        if (index !== undefined) {
            const elem = this._ui.getControlByName("Quest"+index)
            if (elem) {
                elem.dispose();
                if (update) {
                    this._updateGUI();
                }
            }
            this._npcs.delete(index);
            this._map.delete(id);
        }
    }

    private _checkQuests(update=true) {
        const check = (index: number) => {

            const npc = this._npcs.get(index) as NPC;
            if ((npc.quest?.timeLeft as number) > 0) return;

            let outcome = QuestStatus.FAILURE;
            if (npc.tryCompleteQuest()) {
                Events.emit("inventory:add", npc.quest?.items[0]);
                Events.emit("inventory:remove", npc.quest?.rewards[0]);
                outcome = QuestStatus.SUCCESS;
            } else {
                Events.emit("inventory:remove", npc.quest?.rewards[0]);
            }

            Events.emit("quest:completed", {
                id: npc.id,
                result: outcome
            });

            this.removeQuest(npc.id, update);
        }

        Array.from(this._map.values()).forEach(check);
    }

    private _updateGUI() {
        const makeOrUpdateElem = (index: number) => {

            const control = this._ui.getControlByName("Quest"+index);
            if (control) {
                control.dispose();
            }

            const elem = this._template.clone();
            const npc = this._npcs.get(index) as NPC;

            const fIdx = 0;

            elem.isVisible = false;
            elem.name = "Quest" + index;

            const descendants = elem.getDescendants(false, (control: Control) => {
                return control.getClassName() === "TextBlock";
            });

            const name = descendants.find((d: Control) => d.name === "QuestNPCName"+fIdx) as TextBlock
            name.name = "QuestNPCName" + index;
            name.text = npc.name;

            const time = descendants.find((d: Control) => d.name === "QuestTimeLeft"+fIdx) as TextBlock
            time.name = "QuestTimeLeft" + index;
            time.text = `Time Left: ${npc.quest?.timeLeftInDays} d ${npc.quest?.timeLeftInHours} h`;

            const item = descendants.find((d: Control) => d.name === "QuestReward"+fIdx) as TextBlock
            item.name = "QuestReward" + index;
            item.text = "Item(s): " + npc.quest?.items[0].toString()

            elem.isVisible = true;
            this._parent.addControl(elem)
        }

        const values = Array.from(this._map.values());
        values.sort((a: number, b: number) => {
            const npcA = this._npcs.get(a) as NPC;
            const npcB = this._npcs.get(b) as NPC;
            return npcA.questTimeLeft - npcB.questTimeLeft;
        })
        values.forEach(makeOrUpdateElem);
    }
}
