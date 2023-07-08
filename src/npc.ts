import { NPCRole } from "./core/enums";
import { v4 as uuid } from 'uuid';
import Quest from "./quest";

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
        this.quest = quest;
        // TODO: calculate probabilites
    }
}
