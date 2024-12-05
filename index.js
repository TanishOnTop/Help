const mineflayer = require("mineflayer");
const readline = require("readline");
const pvp = require("mineflayer-pvp").plugin;
const { pathfinder, goals } = require("mineflayer-pathfinder");
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

  // Function to attack Pigmen in front of the bot
  function attackPigmenInFront() {
    setInterval(() => {
      if (bot.entity && bot.entity.position) {
        // Scan for entities in front of the bot
        const target = bot.nearestEntity((entity) => {
          // Check if the entity is in front of the bot (you can adjust this angle)
          const angle = bot.entity.rotation.y;
          const entityPosition = entity.position;

          // Check if the entity is within a 180-degree cone in front of the bot
          const angleToEntity = Math.atan2(
            entityPosition.x - bot.entity.position.x,
            entityPosition.z - bot.entity.position.z
          );
          const diff = Math.abs(angle - angleToEntity);

          // Only target Pigmen (Zombie Pigmen)
          return (
            diff < Math.PI / 4 && // 45-degree cone
            (entity.type === "pig" || entity.type === "zombie_pigman") // Target only Pigmen
          );
        });

        if (target) {
          console.log(`Found a Pigman in front, attacking ${target.displayName || target.username}`);
          bot.attack(target);
        }
      }
    }, 1000); // Check every 1 second
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

  // Start the attack loop when bot is ready
  bot.on("spawn", () => {
    attackPigmenInFront(); // Start attacking Pigmen in front
  });
}

// Start the bot
createBot();
