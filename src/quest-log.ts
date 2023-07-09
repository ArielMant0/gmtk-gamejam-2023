import { AdvancedDynamicTexture, Control, TextBlock, Image } from "@babylonjs/gui";
import NPC from "./npc";
import { Events } from "./core/events";
import { QuestStatus } from "./core/enums";
import { roleToIcon } from "./core/assets";

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

        const mainIcon = this._ui.getControlByName("QuestImage") as Image
        mainIcon.source = "icons/checklist.png"
    }

    public reset() {
        this._count = 1;
        this._map.forEach(index => {
            const c = this._ui.getControlByName("Quest"+index)
            c?.dispose();
        });
        this._map.clear();
        this._npcs.clear();
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
                outcome = QuestStatus.SUCCESS;
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

            elem.isVisible = false;
            elem.name = "Quest" + index;

            const descendants = elem.getDescendants(false, (control: Control) => {
                return control.getClassName() === "TextBlock" || control.getClassName() === "Image";
            });

            const name = descendants.find((d: Control) => d.name === "QuestNPCName0") as TextBlock
            name.text = npc.name;

            const time = descendants.find((d: Control) => d.name === "QuestTimeLeft0") as TextBlock
            time.text = `Time Left: ${npc.quest?.timeLeftInDays} d ${npc.quest?.timeLeftInHours} h`;

            const item = descendants.find((d: Control) => d.name === "QuestReward0") as TextBlock
            item.text = "Item(s): " + npc.quest?.items[0].toString()

            const head = descendants.find((d: Control) => d.name === "QuestNPCIcon0") as Image
            head.source = "icons/" + npc.head;

            const role = descendants.find((d: Control) => d.name === "QuestNPCRole0") as Image
            role.source = "icons/" + roleToIcon(npc.role);

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
