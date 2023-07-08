import { Tools } from "@babylonjs/core";
import { NPCRole, QuestItemType } from "./enums";
import { parse } from 'csv-parse/browser/esm/sync';
import NPC from "../npc";
import Quest from "../quest";

class NPCBalancing {

    private _tables = new Map<NPCRole, Map<QuestItemType, Object>>();

    constructor() {
        this.loadTable(NPCRole.FIGHTER, "balancing/fighter_table.csv")
        this.loadTable(NPCRole.HUNTER, "balancing/hunter_table.csv")
        this.loadTable(NPCRole.GATHERER, "balancing/gatherer_table.csv")
        this.loadTable(NPCRole.THIEF, "balancing/thief_table.csv")
    }

    public loadTable(role: NPCRole, url: string) {
        Tools.LoadFile(url, (data) => {
            const records = parse(data as string, {
                columns: true,
                skip_empty_lines: true
            });
            const map = new Map<QuestItemType, Object>();
            records.forEach((d: any) => {
                map.set(QuestItemType[d.item_type as string], {
                    base_probability: Number.parseInt(d.base_probability),
                    min_gold_compensation: Number.parseInt(d.min_gold_compensation),
                    quantity_per_day: Number.parseInt(d.quantity_per_day),
                    quantity_step: Number.parseInt(d.quantity_step)
                })
            })
            this._tables.set(role, map);
        });
    }

    public getAcceptanceProbability(npc: NPC, quest: Quest) {
        const role = npc.role;
        const map = this._tables.get(role);
        if (map) {
            const itemQ = quest.items[0];
            const values = map.get(itemQ.item as QuestItemType) as any
            if (values) {
                const base = values.base_probability;
                const compensation = quest.rewards[0].amount;
                return Math.min(100, base * (compensation / (values.min_gold_compensation)));
            }
        }
        return 0;
    }

    public getSuccessProbability(npc: NPC, quest: Quest) {
        const role = npc.role;
        const map = this._tables.get(role);
        if (map) {
            const itemQ = quest.items[0];
            const values = map.get(itemQ.item as QuestItemType) as any
            if (values) {
                const base = values.base_probability / 100;
                const quantity = itemQ.amount;
                return Math.min(100, 100 * Math.pow(base, Math.ceil(quantity / values.quantity_step)));
            }
        }
        return 0;
    }

    public getQuestDuration(npc: NPC, quest: Quest) {
        const role = npc.role;
        const map = this._tables.get(role);
        if (map) {
            const itemQ = quest.items[0];
            if (itemQ && itemQ.item !== null) {
                const values = map.get(itemQ.item as QuestItemType) as any
                if (values) {
                    const targetQuantity = quest.items[0].amount;
                    return Math.ceil(targetQuantity / values.quantity_step) * values.quantity_per_day * 24;
                }
            }
        }
        return 24;
    }
}

export const NPCB = new NPCBalancing();
