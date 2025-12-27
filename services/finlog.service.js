const crypto = require("crypto");

function createFinLogEntry(interaction, categoryId, categoryName, type) {
  const amount = interaction.fields.getTextInputValue("amount").trim();
  const notes = interaction.fields.getTextInputValue("notes")?.trim() || "";

  return {
    entryId: crypto.randomUUID(),
    userId: interaction.user.id,
    userName: interaction.user.username,
    date: interaction.fields.getTextInputValue("date").trim(),
    type: type,
    amount: parseFloat(amount),
    categoryId: categoryId,
    category: categoryName,
    notes: notes,
    submittedAt: new Date().toISOString()
  };
}

function formatFinLogMessage(entry) {
  const emoji = entry.type.toLowerCase() === "income" ? "💰" : "💸";
  const typeLabel = entry.type.toLowerCase() === "income" ? "Income" : "Expense";

  let message = (
    `${emoji}  **Financial Log Entry**\n` +
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

  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `⏰  **Logged at:**  ${new Date(entry.submittedAt).toLocaleString()}`;

  return message;
}

module.exports = {
  createFinLogEntry,
  formatFinLogMessage
};
