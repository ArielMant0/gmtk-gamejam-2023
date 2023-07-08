import { NPCRole } from "./core/enums";
import { v4 as uuid } from 'uuid';
import Quest from "./quest";
import { NPCB } from "./core/npc-balancing";
import { Chance } from "chance";

const chance = new Chance();

export default class NPC {

    public id: string;
    public name: string;
    public role: NPCRole;
    public level: number;

    public quest: Quest | null = null;
    public acceptProb: number = 1;
    public successProb: number = 1;

    constructor(name: string, role: NPCRole, level: number) {
        this.id = uuid();
        this.name = name;
        this.role = role;
        this.level = Math.max(1, Math.round(level));
    }

    public assignQuest(quest: Quest) {
        // calculate probabilites
        this.recalculate(quest);
        if (chance.bool({ likelihood: this.acceptProb })) {
            this.quest = quest;
            console.log("quest accepted")
            return true;
        } else {
            console.log("quest rejected")
            return false;
        }
    }

    public tryCompleteQuest() {
        return chance.bool({ likelihood: this.successProb })
    }

    public recalculate(quest: Quest | null = null) {
        if (quest === null && this.quest === null) return;
        if (quest === null && this.quest !== null) quest = this.quest

        // @ts-ignore
        this.acceptProb = NPCB.getAcceptanceProbability(this, quest)
        // @ts-ignore
        this.successProb = NPCB.getSuccessProbability(this, quest);
    }
}
