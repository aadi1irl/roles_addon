import {
    world,
    system,
    Player,
    CommandPermissionLevel,
    CustomCommandParamType,
    CustomCommandStatus
} from "@minecraft/server";

/*
 * KINGDOM ROLES
 * Command: /role randomall
 * Every player starts as Peasant until the admin runs the command.
 * Random roles are saved on each player and survive relogging/death.
 */

const ROLE_PROPERTY = "kingdom:role";
const ROLE_ACTION_ENUM = "kingdom:role_action";
const EFFECT_DURATION = 20 * 60; // 60 seconds, refreshed periodically

const ROLES = [
    {
        name: "Peasant",
        hearts: 10,
        effects: [],
        particle: "minecraft:basic_smoke_particle"
    },
    {
        name: "Citizen",
        hearts: 12,
        effects: [{ id: "haste", amplifier: 0 }],
        particle: "minecraft:happy_villager_particle"
    },
    {
        name: "Soldier",
        hearts: 14,
        effects: [{ id: "strength", amplifier: 0 }],
        particle: "minecraft:basic_flame_particle"
    },
    {
        name: "Knight",
        hearts: 16,
        effects: [
            { id: "strength", amplifier: 0 },
            { id: "speed", amplifier: 0 }
        ],
        particle: "minecraft:crit_particle"
    },
    {
        name: "Commander",
        hearts: 18,
        effects: [
            { id: "strength", amplifier: 0 },
            { id: "speed", amplifier: 0 },
            { id: "haste", amplifier: 0 }
        ],
        particle: "minecraft:lava_particle"
    },
    {
        name: "Lord",
        hearts: 20,
        effects: [
            { id: "strength", amplifier: 1 },
            { id: "speed", amplifier: 0 }
        ],
        particle: "minecraft:totem_particle"
    },
    {
        name: "Duke",
        hearts: 22,
        effects: [
            { id: "strength", amplifier: 1 },
            { id: "speed", amplifier: 1 }
        ],
        particle: "minecraft:enchanted_hit_particle"
    },
    {
        name: "Prince",
        hearts: 24,
        effects: [
            { id: "strength", amplifier: 1 },
            { id: "speed", amplifier: 1 },
            { id: "resistance", amplifier: 0 }
        ],
        particle: "minecraft:dragon_breath_trail"
    },
    {
        name: "King",
        hearts: 26,
        effects: [
            { id: "strength", amplifier: 1 },
            { id: "speed", amplifier: 1 },
            { id: "resistance", amplifier: 0 },
            { id: "haste", amplifier: 1 }
        ],
        particle: "minecraft:totem_particle"
    },
    {
        name: "Emperor",
        hearts: 30,
        effects: [
            { id: "strength", amplifier: 1 },
            { id: "speed", amplifier: 2 },
            { id: "resistance", amplifier: 1 },
            { id: "haste", amplifier: 1 }
        ],
        particle: "minecraft:dragon_breath_trail"
    }
];

const MANAGED_EFFECTS = ["health_boost", "strength", "speed", "haste", "resistance"];

function getRole(name) {
    return ROLES.find(role => role.name.toLowerCase() === String(name).toLowerCase()) ?? ROLES[0];
}

function getPlayerRole(player) {
    const saved = player.getDynamicProperty(ROLE_PROPERTY);
    return typeof saved === "string" ? getRole(saved) : ROLES[0];
}

function clearManagedEffects(player) {
    for (const effect of MANAGED_EFFECTS) {
        try {
            player.removeEffect(effect);
        } catch (_) {}
    }
}

function applyRole(player, roleName, announce = false) {
    if (!player || !player.isValid) return;

    const role = getRole(roleName);
    player.setDynamicProperty(ROLE_PROPERTY, role.name);

    // Remove effects managed by this add-on so old role bonuses do not carry over.
    clearManagedEffects(player);

    // Health Boost adds 2 hearts per effect level. Vanilla base is 10 hearts.
    const extraHearts = Math.max(0, role.hearts - 10);
    if (extraHearts > 0) {
        const healthBoostLevel = Math.ceil(extraHearts / 2);
        try {
            player.addEffect("health_boost", EFFECT_DURATION, {
                amplifier: healthBoostLevel - 1,
                showParticles: false
            });
        } catch (_) {}
    }

    for (const effect of role.effects) {
        try {
            player.addEffect(effect.id, EFFECT_DURATION, {
                amplifier: effect.amplifier,
                showParticles: false
            });
        } catch (_) {}
    }

    // Restore the player to full health after the new max-health bonus is applied.
    try {
        system.run(() => {
            if (!player.isValid) return;
            const health = player.getComponent("minecraft:health");
            if (health) health.resetToMaxValue();
        });
    } catch (_) {}

    if (announce) {
        try {
            player.sendMessage(`§6[Kingdom] §fYour role is now §e${role.name}§f! §c${role.hearts} hearts`);
        } catch (_) {}
    }
}

function randomRole() {
    return ROLES[Math.floor(Math.random() * ROLES.length)];
}

function randomizeAllPlayers() {
    const players = world.getPlayers();
    if (players.length === 0) return 0;

    for (const player of players) {
        const role = randomRole();
        applyRole(player, role.name, true);
    }
    return players.length;
}

// Register the exact user-facing command: /role randomall
system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
    customCommandRegistry.registerEnum(ROLE_ACTION_ENUM, ["randomall"]);

    customCommandRegistry.registerCommand(
        {
            name: "kingdom:role",
            description: "Kingdom SMP role controls.",
            permissionLevel: CommandPermissionLevel.Admin,
            cheatsRequired: false,
            mandatoryParameters: [
                { name: ROLE_ACTION_ENUM, type: CustomCommandParamType.Enum }
            ]
        },
        (origin, action) => {
            if (action !== "randomall") {
                return {
                    status: CustomCommandStatus.Failure,
                    message: "Use /role randomall"
                };
            }

            // Custom command callbacks run in read-only mode; defer world changes.
            system.run(() => {
                const count = randomizeAllPlayers();
                if (count > 0) {
                    world.sendMessage(`§6[Kingdom] §aRandom roles assigned to ${count} online player(s)!`);
                } else {
                    world.sendMessage("§c[Kingdom] No players are online.");
                }
            });

            return {
                status: CustomCommandStatus.Success,
                message: "Random role assignment started."
            };
        }
    );
});

// New players are Peasants until randomall has been run for them.
// Existing saved roles are restored on join/respawn.
world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
    system.runTimeout(() => {
        if (!player.isValid) return;
        const saved = player.getDynamicProperty(ROLE_PROPERTY);

        if (typeof saved !== "string") {
            applyRole(player, "Peasant", false);
            if (initialSpawn) {
                try {
                    player.sendMessage("§7Your starting role is §fPeasant§7. Wait for the kingdom role draw!");
                } catch (_) {}
            }
        } else {
            applyRole(player, saved, false);
        }
    }, 5);
});

// Refresh effects so they remain active. Also emit a subtle role particle.
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        try {
            if (!player.isValid) continue;
            const role = getPlayerRole(player);

            // Re-apply only managed role effects to keep them active after their timer expires.
            for (const effect of role.effects) {
                const current = player.getEffect(effect.id);
                if (!current || current.duration < 20 * 10) {
                    player.addEffect(effect.id, EFFECT_DURATION, {
                        amplifier: effect.amplifier,
                        showParticles: false
                    });
                }
            }

            const extraHearts = Math.max(0, role.hearts - 10);
            if (extraHearts > 0) {
                const neededLevel = Math.ceil(extraHearts / 2) - 1;
                const healthEffect = player.getEffect("health_boost");
                if (!healthEffect || healthEffect.duration < 20 * 10) {
                    player.addEffect("health_boost", EFFECT_DURATION, {
                        amplifier: neededLevel,
                        showParticles: false
                    });
                }
            }

            if (role.name !== "Peasant" && system.currentTick % 40 === 0) {
                try {
                    player.dimension.spawnParticle(role.particle, {
                        x: player.location.x,
                        y: player.location.y + 1,
                        z: player.location.z
                    });
                } catch (_) {
                    // Particle identifiers can vary by Bedrock version; role powers still work.
                }
            }
        } catch (_) {}
    }
}, 20);
