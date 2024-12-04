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
    port: 25565,
    username: "fireball_022",
    plugins: [AutoAuth],
    AutoAuth: {
      password: "Yourgifttanish", // Set the password here
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
      const compass = bot.inventory.items().find((item) => item.name.includes("compass"));
      if (compass) {
        console.log("Compass found! Opening it...");
        bot.activateItem();
      } else {
        console.log("Compass not found in inventory.");
      }
    }, 3000); // Wait 3 seconds to ensure bot is fully spawned
  });

  bot.on("windowOpen", (window) => {
    console.log("GUI opened!");
    window.slots.forEach((item, index) => {
      if (item) {
        console.log(`Slot ${index}: ${item.displayName}`);
      }
    });

    const lifestealSlot = window.slots.findIndex(
      (item) => item && item.displayName.includes("Purple Dye")
    );
    if (lifestealSlot !== -1) {
      console.log(`Lifesteal Realm found in slot ${lifestealSlot}`);
      bot.clickWindow(lifestealSlot, 0, 0);
    } else {
      console.log("Lifesteal Realm not found in any slot!");
    }
  });

  setInterval(() => {
    bot.swingArm("right");
    console.log("Swinging the sword...");
  }, 1000); // Swing the sword every second

  bot.on("chat", (username, message) => {
    console.log(`[${username}] ${message}`);
  });

  bot.on("kicked", (reason) => {
    console.log("Bot was kicked: ", reason);
  });

  bot.on("error", (err) => {
    console.error("Bot encountered an error: ", err);
  });

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
