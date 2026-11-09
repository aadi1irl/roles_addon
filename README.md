# 👑 Kingdom Roles

A role-based progression add-on for **Minecraft Bedrock Edition**, designed for Kingdom SMP servers.

Kingdom Roles introduces a random role assignment system where every player starts as a Peasant until the administrator triggers the role draw.

## ✨ Features

- 🎲 **Random Role Assignment** – Assign random roles to all online players.
- ❤️ **Custom Health** – Different maximum hearts for each role.
- ⚔️ **Potion Effects** – Strength, Speed, Haste and Resistance.
- ✨ **Particle Effects** – Unique visual particles for different roles.
- 💾 **Role Persistence** – Roles are saved when players leave and rejoin.
- 👑 **Admin Control** – Only administrators can execute the role assignment command.

## 🎮 Available Roles

| Role      | Hearts | Abilities                                       |
| --------- | -----: | ----------------------------------------------- |
| Peasant   |     10 | None                                            |
| Citizen   |     12 | Haste I                                         |
| Soldier   |     14 | Strength I                                      |
| Knight    |     16 | Strength I, Speed I                             |
| Commander |     18 | Strength I, Speed I, Haste I                    |
| Lord      |     20 | Strength II, Speed I                            |
| Duke      |     22 | Strength II, Speed II                           |
| Prince    |     24 | Strength II, Speed II, Resistance I             |
| King      |     26 | Strength II, Speed II, Resistance I, Haste II   |
| Emperor   |     30 | Strength II, Speed III, Resistance II, Haste II |

## ⌨️ Command

The add-on uses one main command:

```mcfunction
/role randomall
```

**What happens?**

1. All players initially receive the Peasant role.
2. The administrator executes `/role randomall`.
3. Every online player receives a randomly selected role.
4. Duplicate roles are allowed.
5. Each player's hearts and potion effects update automatically.

## 📦 Installation

1. Download the latest `.mcaddon` release.
2. Open the file with Minecraft Bedrock Edition.
3. Import the add-on.
4. Open your world settings.
5. Activate the Kingdom Roles Behavior Pack.
6. Enable the required Script API support if prompted.
7. Give yourself operator permissions.
8. Run `/role randomall`.

## 🛠️ Built With

- Minecraft Bedrock Script API
- JavaScript
- JSON
- Minecraft Behavior Packs

## 📁 Project Structure

```text
Kingdom-Roles/
├── manifest.json
├── pack_icon.png
└── scripts/
    └── main.js
```

## 🚧 Future Plans

- [ ] Custom role GUI
- [ ] More royal ranks
- [ ] Unique abilities for each role
- [ ] Role-specific sounds
- [ ] Custom animations
- [ ] Improved particle effects
- [ ] Role management system

## 📜 License

This project is intended for Minecraft SMP servers and personal use. Add your preferred open-source license before redistributing the source.

---

**Made for Kingdom SMP 👑**

*Build Your Kingdom. Rule The World.*
