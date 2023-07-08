import { Chance } from "chance";
import { NPCRole } from "./enums";

const chance = new Chance();

function randomNPCHeadIcon() {
    return chance.pickone([
        "icons/barbarian.png",
        "icons/barbute.png",
        "icons/cleopatra.png",
        "icons/female-vampire.png",
        "icons/golem-head.png",
        "icons/ninja-head.png",
        "icons/wizard-face.png",
        "icons/woman-elf-face.png",
    ])
}

function roleToIcon(role: NPCRole) {
    switch(role) {
        case NPCRole.FIGHTER:
            return "icons/swordwoman.png"
        case NPCRole.THIEF:
            return "icons/hooded-assassin.png"
        case NPCRole.HUNTER:
            return "icons/bowman.png"
        case NPCRole.GATHERER:
            return "icons/farmer.png"
    }
}

export { randomNPCHeadIcon, roleToIcon };
