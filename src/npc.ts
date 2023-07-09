import { NPCRole } from "./core/enums";
import { v4 as uuid } from 'uuid';
import Quest from "./quest";
import { NPCB } from "./core/npc-balancing";
import { Chance } from "chance";
import { randomNPCHeadIcon } from "./core/assets";

const chance = new Chance();

export default class NPC {

    public id: string;
    public name: string;
    public role: NPCRole;
    public level: number;

    public head: string;

    public quest: Quest | null = null;

    public acceptProb: number = 0;
    public successProb: number = 0;

    public acceptedQuest: boolean = false;

    constructor(name: string, role: NPCRole, level: number) {
        this.id = uuid();
        this.name = name;
        this.role = role;
        this.level = Math.max(1, Math.round(level));
        this.head = randomNPCHeadIcon();
    }

    public get questTimeLeft() {
        return this.quest === null ? Number.MAX_SAFE_INTEGER : this.quest.timeLeft;
    }

    public wouldAcceptQuest(quest: Quest) {
        this.recalculate(quest);
        this.acceptedQuest = chance.bool({ likelihood: this.acceptProb })
        return this.acceptedQuest;
    }

    public assignQuest(quest: Quest, calculate=false) {
        // calculate probabilites
        if (calculate) {
            this.recalculate(quest);
            this.acceptedQuest = chance.bool({ likelihood: this.acceptProb })
        }

        if (this.acceptedQuest) {
            this.quest = quest;
            console.debug("quest accepted")
            return true;
        } else {
            console.debug("quest rejected")
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
