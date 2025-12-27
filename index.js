// const {
//   Client,
//   GatewayIntentBits,
//   ModalBuilder,
//   TextInputBuilder,
//   TextInputStyle,
//   ActionRowBuilder
// } = require("discord.js");
// require("dotenv").config();

// const client = new Client({
//   intents: [GatewayIntentBits.Guilds]
// });

// client.once("ready", () => {
//   console.log(`Logged in as ${client.user.tag}`);
// });

// client.on("interactionCreate", async interaction => {
//   if (!interaction.isChatInputCommand()) return;

//   if (interaction.commandName === "leave") {
//     const modal = new ModalBuilder()
//       .setCustomId("leaveRequest")
//       .setTitle("Leave Request");

//     const type = new TextInputBuilder()
//       .setCustomId("type")
//       .setLabel("Leave Type (Annual / Sick / Other)")
//       .setStyle(TextInputStyle.Short)
//       .setRequired(true);

//     const start = new TextInputBuilder()
//       .setCustomId("start")
//       .setLabel("Start Date (YYYY-MM-DD)")
//       .setStyle(TextInputStyle.Short)
//       .setRequired(true);

//     const end = new TextInputBuilder()
//       .setCustomId("end")
//       .setLabel("End Date (YYYY-MM-DD)")
//       .setStyle(TextInputStyle.Short)
//       .setRequired(true);

//     const reason = new TextInputBuilder()
//       .setCustomId("reason")
//       .setLabel("Reason")
//       .setStyle(TextInputStyle.Paragraph)
//       .setRequired(false);

//     modal.addComponents(
//       new ActionRowBuilder().addComponents(type),
//       new ActionRowBuilder().addComponents(start),
//       new ActionRowBuilder().addComponents(end),
//       new ActionRowBuilder().addComponents(reason)
//     );

//     await interaction.showModal(modal);
//   }
// });

// client.on("interactionCreate", async interaction => {
//   if (!interaction.isModalSubmit()) return;
//   if (interaction.customId !== "leaveRequest") return;

//   const leave = {
//     user: interaction.user.username,
//     type: interaction.fields.getTextInputValue("type"),
//     start: interaction.fields.getTextInputValue("start"),
//     end: interaction.fields.getTextInputValue("end"),
//     reason: interaction.fields.getTextInputValue("reason")
//   };

//   console.log("Leave request:", leave);

//   await interaction.reply({
//     content: "✅ Your leave request has been submitted.",
//     ephemeral: true
//   });
// });

// client.login(process.env.DISCORD_TOKEN);


require("dotenv").config();

const { Client, GatewayIntentBits, Collection } = require("discord.js");

// ✅ CREATE CLIENT (THIS WAS MISSING)
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Optional: command collection
client.commands = new Collection();

// Load commands
const leaveCommand = require("./commands/leave.command");
client.commands.set(leaveCommand.data.name, leaveCommand);

// Ready
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Interaction handler
client.on("interactionCreate", async interaction => {
  try {
    // Slash command
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
    }

    // Modal submit
    if (interaction.isModalSubmit()) {
      const {
        createLeaveRequest,
        formatLeaveMessage
      } = require("./services/leave.service");

      const {
        buildApprovalButtons
      } = require("./interactions/leave.buttons");

      const {
        HR_REVIEW_CHANNEL_ID,
        LEAVE_MODAL_ID
      } = require("./constants/hr.constants");

      if (interaction.customId !== LEAVE_MODAL_ID) return;

      const leaveRequest = createLeaveRequest(interaction);

      const channel = await client.channels.fetch(HR_REVIEW_CHANNEL_ID);

      await channel.send({
        content: formatLeaveMessage(leaveRequest),
        components: [buildApprovalButtons(leaveRequest.requestId)]
      });

      await interaction.reply({
        content: "✅ Leave request submitted for approval.",
        ephemeral: true
      });
    }

    // Button click
    if (interaction.isButton() && interaction.customId.startsWith("leave:")) {
      const { handleLeaveButtons } = require("./interactions/leave.buttons");
      await handleLeaveButtons(interaction);
    }

  } catch (err) {
    console.error("❌ Interaction error:", err);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "❌ Something went wrong.",
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: "❌ Something went wrong.",
        ephemeral: true
      });
    }
  }
});

// Login
client.login(process.env.DISCORD_TOKEN);
