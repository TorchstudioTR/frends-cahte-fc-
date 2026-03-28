// custom_items.js
// === Custom Item Registry ===
const CustomItemRegistry = {
    nextID: 4096, 
    items: {},

    generateID() {
        const id = this.nextID;
        this.nextID++;
        return id;
    },

    register(name, properties = {}) {
        const id = this.generateID();
        const item = { id, name, ...properties };

        if (typeof ModAPI !== "undefined" && ModAPI.items) {
            ModAPI.items.register(item);
        } else {
            console.warn("ModAPI.items erişilemiyor, injection başarısız!");
        }

        this.items[name] = item;
        return item;
    },

    reflect(name, properties = {}) {
        const item = this.items[name];
        if (!item) {
            console.warn(`${name} kayıtlı değil`);
            return null;
        }

        if (typeof ModAPI !== "undefined" && ModAPI.reflect) {
            ModAPI.reflect(item.id, properties);
        }

        Object.assign(item, properties);
        return item;
    }
};

// === Yeni Itemler ===
const copperArmor = CustomItemRegistry.register("Copper Armor", {
    defense: 5,
    durability: 150,
    texture: "textures/items/copper_armor.png"
});

const rubyArmor = CustomItemRegistry.register("Ruby Armor", {
    defense: 8,
    durability: 300,
    texture: "textures/items/ruby_armor.png"
});

const bedrockChest = CustomItemRegistry.register("Bedrock Chest", {
    explosionResistance: Infinity,
    texture: "textures/items/bedrock_chest.png",
    owner: "player.name"
});

const nokiaPickaxe = CustomItemRegistry.register("Nokia Pickaxe", {
    tier: "diamond",
    durability: 1000,
    texture: "textures/items/nokia_pickaxe.png",
    superBreaker: true
});

// === Etkinlikler ===
ModAPI.addEventListener('update', () => {
    if (!player || !player.getArmor) return;
    const armor = player.getArmor();
    if (armor && armor.id === copperArmor.id && world.isStormy()) {
        const pos = player.getPosition();
        world.spawnLightning(pos.x, pos.y + 1, pos.z);
    }
});

ModAPI.addEventListener('blockBreak', (block, heldItem) => {
    if (block.name === "Ruby Ore") {
        const allowedTiers = ["iron", "diamond", "netherite"];
        if (!allowedTiers.includes(heldItem.tier) && !heldItem.superBreaker) {
            block.cancelDrop = true;
        }
    }
    if (heldItem && heldItem.id === nokiaPickaxe.id) {
        if (block.name === "Obsidian" || block.name === "Layered Rock") {
            block.breakable = true;
        }
    }
});

ModAPI.addEventListener('interact', (block) => {
    if (block.id === bedrockChest.id && player.name !== bedrockChest.owner) {
        return false;
    }
});
