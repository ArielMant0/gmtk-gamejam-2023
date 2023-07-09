enum GameState {
    START,
    GAME,
    LOAD,
    PAUSE,
    LOSE,
    WIN
}

enum QuestItemType {
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
const QuestItemTypeArray = Object.values(QuestItemType).filter(d => typeof d === "string");

function questItemTypeToString(item: QuestItemType | null, amount: number = 1) {
    switch(item) {
        case QuestItemType.MONEY:
            return amount > 1 ? "Coins" : "Coin";
        case QuestItemType.MUSHROOM:
            return amount > 1 ? "Mushrooms" : "Mushroom"
        case QuestItemType.APPLE:
            return amount > 1 ? "Apples" : "Apple"
        case QuestItemType.GEM:
            return amount > 1 ? "Gems" : "Gem"
        case QuestItemType.MEAT:
            return "Meat"
        case QuestItemType.FUR:
            return amount > 1 ? "Furs" : "Fur"
        case QuestItemType.HORSE:
            return amount > 1 ? "Horses" : "Horse"
        case QuestItemType.WEAPON:
            return amount > 1 ? "Weapons" : "Weapon"
        case QuestItemType.HUNTING_TROPHY:
            return amount > 1 ? "Horns & Teeth" : "Horn & Tooth"
        case QuestItemType.MESSAGE:
            return amount > 1 ? "Messages" : "Message"
        default:
            return "_ _ _ _ _ _";
    }
}

function questItemTypeIcon(item: QuestItemType) {
    switch(item) {
        case QuestItemType.MONEY:
            return "assets/icons/coins.png";
        case QuestItemType.MUSHROOM:
            return "assets/icons/mushroom-gills.png";
        case QuestItemType.APPLE:
            return "assets/icons/shiny-apple.png";
        case QuestItemType.GEM:
            return "assets/icons/emerald.png";
        case QuestItemType.MEAT:
            return "assets/icons/meat.png";
        case QuestItemType.FUR:
            return "assets/icons/fur-shirt.png";
        case QuestItemType.HORSE:
            return "assets/icons/horse-head.png";
        case QuestItemType.WEAPON:
            return "assets/icons/spinning-sword.png";
        case QuestItemType.HUNTING_TROPHY:
            return "assets/icons/mighty-horn.png";
        case QuestItemType.MESSAGE:
            return "assets/icons/envelope.png";
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

enum QuestStatus {
    PENDING,
    SUCCESS,
    FAILURE
}

enum DialogPhase {
    NONE,
    START,
    QUEST,
    END
}

export {
    GameState,
    QuestStatus,
    QuestItemType, QuestItemTypeArray, questItemTypeToString, questItemTypeIcon,
    NPCRole, NPCRoleArray, npcRoleToString,
    DialogPhase
};
