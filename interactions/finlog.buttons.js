const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const {
  FINLOG_CHANNEL_ID,
  BUTTON_ACTIONS
} = require("../constants/finlog.constants");

const { storeFinancialLog } = require("../services/api.service");
const { formatFinLogMessage } = require("../services/finlog.service");

// Store pending entries temporarily (in production, use Redis or database)
const pendingEntries = new Map();

function buildConfirmButtons(entryId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`finlog:${BUTTON_ACTIONS.CONFIRM}:${entryId}`)
      .setLabel("Confirm")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`finlog:${BUTTON_ACTIONS.CANCEL}:${entryId}`)
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Danger)
  );
}

function formatPreviewMessage(entry) {
  const emoji = entry.type.toLowerCase() === "income" ? "💰" : "💸";
  const typeLabel = entry.type.toLowerCase() === "income" ? "Income" : "Expense";

  let message = (
    `${emoji}  **Financial Log Preview**\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `👤  **User:**  ${entry.userName}\n\n` +
    `📅  **Date:**  ${entry.date}\n\n` +
    `📊  **Type:**  ${typeLabel}\n\n` +
    `💵  **Amount:**  $${entry.amount.toFixed(2)}\n\n` +
    `🏷️  **Category:**  ${entry.category}\n\n`
  );

  if (entry.notes) {
    message += `📝  **Notes:**  ${entry.notes}\n\n`;
  }

  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `⚠️  **Please confirm to save this entry.**`;

  return message;
}

function storePendingEntry(entryId, entry) {
  pendingEntries.set(entryId, entry);
  // Auto-expire after 5 minutes
  setTimeout(() => {
    pendingEntries.delete(entryId);
  }, 5 * 60 * 1000);
}

function getPendingEntry(entryId) {
  return pendingEntries.get(entryId);
}

function deletePendingEntry(entryId) {
  pendingEntries.delete(entryId);
}

async function handleFinLogButtons(interaction, client) {
  const [, action, entryId] = interaction.customId.split(":");

  const entry = getPendingEntry(entryId);

  if (!entry) {
    return interaction.update({
      content: "❌ This entry has expired or was already processed.",
      components: []
    });
  }

  // Check if the user who clicked is the same who created the entry
  if (entry.userId !== interaction.user.id) {
    return interaction.reply({
      content: "❌ Only the person who created this entry can confirm or cancel it.",
      ephemeral: true
    });
  }

  if (action === BUTTON_ACTIONS.CONFIRM) {
    // Store in Laravel database
    try {
      await storeFinancialLog({
        category_id: parseInt(entry.categoryId),
        amount: entry.amount,
        type: entry.type.toLowerCase() === "income" ? "income" : "expense",
        transaction_date: entry.date,
        description: entry.notes || `Discord: ${entry.userName}`,
        discord_user_id: entry.userId,
        discord_username: entry.userName
      });

      // Send to finlog channel
      const channel = await client.channels.fetch(FINLOG_CHANNEL_ID);
      await channel.send({
        content: formatFinLogMessage(entry)
      });

      await interaction.update({
        content: `✅ **Entry Confirmed & Saved**\n${formatFinLogMessage(entry)}`,
        components: []
      });

    } catch (apiError) {
      console.error("Failed to store in Laravel:", apiError.message);
      await interaction.update({
        content: `⚠️ **Entry saved to Discord but failed to sync with database.**\n${formatFinLogMessage(entry)}`,
        components: []
      });
    }
  } else if (action === BUTTON_ACTIONS.CANCEL) {
    await interaction.update({
      content: `❌ **Entry Cancelled** by ${interaction.user.username}`,
      components: []
    });
  }

  deletePendingEntry(entryId);
}

module.exports = {
  buildConfirmButtons,
  formatPreviewMessage,
  storePendingEntry,
  getPendingEntry,
  deletePendingEntry,
  handleFinLogButtons
};
