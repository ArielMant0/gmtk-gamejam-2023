enum GameState {
    START,
    GAME,
    LOAD,
    PAUSE,
    LOSE,
    WIN
}

enum QuestItem {
    MONEY,
    MUSHROOM,
    APPLE,
    GEM,
    MEAT,
    FUR,
    HORSE,
    WEAPON,
    HUNTING_TROPHY,
    MESSAGE
}
const QuestItemArray = Object.values(QuestItem).filter(d => typeof d === "string");

function questItemToString(item: QuestItem | null, amount: number = 1) {
    switch(item) {
        case QuestItem.MONEY:
            return "Gold";
        case QuestItem.MUSHROOM:
            return amount > 1 ? "Mushrooms" : "Mushroom"
        case QuestItem.APPLE:
            return amount > 1 ? "Apples" : "Apple"
        case QuestItem.GEM:
            return amount > 1 ? "Gems" : "Gem"
        case QuestItem.MEAT:
            return "Meat"
        case QuestItem.FUR:
            return amount > 1 ? "Furs" : "Fur"
        case QuestItem.HORSE:
            return amount > 1 ? "Horses" : "Horse"
        case QuestItem.WEAPON:
            return amount > 1 ? "Weapons" : "Weapon"
        case QuestItem.HUNTING_TROPHY:
            return amount > 1 ? "Dragon Teeth" : "Dragon Tooth"
        case QuestItem.MESSAGE:
            return amount > 1 ? "Messages" : "Message"
        default:
            return "_ _ _ _ _ _";
    }
}

enum NPCRole {
    GATHERER,
    HUNTER,
    FIGHTER,
    THIEF
}
const NPCRoleArray = Object.values(NPCRole).filter(d => typeof d === "string");

function npcRoleToString(role: NPCRole) {
    switch(role) {
        default:
        case NPCRole.FIGHTER: return "Fighter";
        case NPCRole.HUNTER: return "Hunter";
        case NPCRole.GATHERER: return "Gatherer";
        case NPCRole.THIEF: return "Thief";
    }
}

export {
    GameState,
    QuestItem, QuestItemArray, questItemToString,
    NPCRole, NPCRoleArray, npcRoleToString
};
