import { Tools } from "@babylonjs/core";
import { NPCRole, QuestItemType } from "./enums";
import { parse } from 'csv-parse/browser/esm/sync';
import NPC from "../npc";
import Quest from "../quest";
import { Chance } from "chance";

const chance = new Chance();

class NPCBalancing {

    private _tables = new Map<NPCRole, Map<QuestItemType, Object>>();
    private _itemdata = new Map<QuestItemType, Object>();

    constructor() {
        this.loadTable(NPCRole.FIGHTER, "assets/balancing/fighter_table.csv")
        this.loadTable(NPCRole.HUNTER, "assets/balancing/hunter_table.csv")
        this.loadTable(NPCRole.GATHERER, "assets/balancing/gatherer_table.csv")
        this.loadTable(NPCRole.THIEF, "assets/balancing/thief_table.csv")

        this.loadItemData("assets/balancing/item_values.csv")
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
                    time_per_quantity_d: Number.parseInt(d.time_per_quantity_d),
                    quantity_step: Number.parseInt(d.quantity_step)
                })
            })
            this._tables.set(role, map);
        });
    }

    public loadItemData(url: string) {
        Tools.LoadFile(url, (data) => {
            const records = parse(data as string, {
                columns: true,
                skip_empty_lines: true
            });
            records.forEach((d: any) => {
                this._itemdata.set(QuestItemType[d.item_type as string], {
                    level: Number.parseInt(d.level),
                    mean_worth: Number.parseInt(d.mean_worth),
                    max_worth: Number.parseInt(d.max_worth),
                    mean_time_per_quantity_h: Number.parseInt(d.mean_time_per_quantity_h),
                    mean_time_per_quantity_d: Number.parseInt(d.mean_time_per_quantity_d),
                    mean_quantity_step: Number.parseInt(d.mean_quantity_step)
                })
            })
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
                return Math.min(100, base * (compensation / (values.min_gold_compensation * itemQ.amount)));
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
        // return 3;
        const role = npc.role;
        const map = this._tables.get(role);
        if (map) {
            const itemQ = quest.items[0];
            if (itemQ && itemQ.item !== null) {
                const values = map.get(itemQ.item as QuestItemType) as any
                if (values) {
                    const targetQuantity = quest.items[0].amount;
                    return Math.ceil(targetQuantity / values.quantity_step) * values.time_per_quantity_d * 24;
                }
            }
        }
        return 24;
    }

    public getItemWorth(item: QuestItemType, amount: number) {
        const values = this._itemdata.get(item as QuestItemType) as any;
        if (values) {
            return values.max_worth * chance.floating({min: 1.1, max: 1.25}) * amount;
        }
        return 0
    }

    public getItemTime(item: QuestItemType, amount: number) {
        const values = this._itemdata.get(item as QuestItemType) as any;
        if (values) {
            return values.mean_time_per_quantity_h * chance.floating({min: 0.75, max: 1.25}) * Math.ceil(amount / values.mean_quantity_step);
        }
        return 0
    }
}

export const NPCB = new NPCBalancing();
