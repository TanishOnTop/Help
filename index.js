const mineflayer = require("mineflayer");
const readline = require("readline");
const pvp = require("mineflayer-pvp").plugin;
const { pathfinder } = require("mineflayer-pathfinder");
const armorManager = require("mineflayer-armor-manager");
const AutoAuth = require("mineflayer-auto-auth");

// Bot creation function
function createBot() {
  const bot = mineflayer.createBot({
    host: "play.potionmc.xyz",
    version: false,
    username: "SB9_Gaming",
    port: 25565,
    plugins: [AutoAuth],
    AutoAuth: {
      password: "afkbot01", // Set the password here
    },
  });

  bot.loadPlugin(pvp);
  bot.loadPlugin(armorManager);
  bot.loadPlugin(pathfinder);

  let botReady = false;

  bot.on("spawn", () => {
    console.log("Bot has spawned and is connected to the server!");
    botReady = true;

    setTimeout(() => {
      // Interact with the compass after spawning
      const compass = bot.inventory.items().find((item) => item.name.includes("compass"));
      if (compass) {
        console.log("Compass found! Opening it...");
        bot.activateItem(); // Simulates right-clicking the compass to open the GUI
      } else {
        console.log("Compass not found in inventory.");
      }
    }, 3000); // Wait 3 seconds to ensure bot is fully spawned
  });

  bot.on("windowOpen", (window) => {
    console.log("GUI opened!");

    // Check all slots in the GUI
    window.slots.forEach((item, index) => {
      if (item) {
        console.log(`Slot ${index}: ${item.displayName}`);
      }
    });

    // Find the slot with "Lifesteal Realm"
    const lifestealSlot = window.slots.findIndex(
      (item) => item && item.displayName.includes("Purple Dye")
    );
    if (lifestealSlot !== -1) {
      console.log(`Lifesteal Realm found in slot ${lifestealSlot}`);
      bot.clickWindow(lifestealSlot, 0, 0); // Click on the "Lifesteal Realm" slot
    } else {
      console.log("Lifesteal Realm not found in any slot!");
    }
  });

  bot.on("windowClose", () => {
    console.log("Window closed. Equipping sword...");

    equipSword(); // Try equipping the sword immediately

    // Set interval to retry equipping the sword every 1 minute if not found
    setInterval(() => {
      equipSword();
    }, 60000); // 60 seconds
  });

  function equipSword() {
    const sword = bot.inventory.items().find((item) => item.name.includes("sword"));
    if (sword) {
      bot.equip(sword, "hand").then(() => {
        console.log("Sword equipped in main hand!");

        // Start attacking nearby mobs
        attackMobs();
      }).catch((err) => {
        console.log("Failed to equip sword: ", err);
      });
    } else {
      console.log("No sword found in inventory. Will retry in 1 minute.");
    }
  }

  function attackMobs() {
    const mob = bot.nearestEntity((entity) => entity.type === "mob");

    if (mob) {
      console.log(`Attacking mob: ${mob.name}`);

      // Only attack without moving
      bot.pvp.attack(mob, {
        sprint: false, // Prevent the bot from sprinting
        followRange: 0, // Disable chasing
      });
    } else {
      console.log("No mobs nearby.");
    }

    // Re-check for mobs every 2 seconds
    setTimeout(attackMobs, 2000);
  }

  bot.on("chat", (username, message) => {
    console.log(`[${username}] ${message}`);
  });

  bot.on("kicked", console.log);
  bot.on("error", console.log);
  bot.on("end", () => {
    console.log("Bot disconnected. Restarting...");
    createBot(); // Restart the bot if it disconnects
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", (input) => {
    if (input.trim()) {
      console.log(`Attempting to send message: ${input}`);
      if (botReady) {
        try {
          bot.chat(input);
          console.log(`Sent: ${input}`);
        } catch (error) {
          console.log("Error sending message: ", error);
        }
      } else {
        console.log("Bot not connected yet.");
      }
    }
  });
}

// Start the bot
createBot();
