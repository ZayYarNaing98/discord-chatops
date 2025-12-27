const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");

const { FINLOG_MODAL_ID } = require("../constants/finlog.constants");

async function showFinLogModal(interaction, selectedCategory, selectedType) {
  const typeLabel = selectedType === "income" ? "💰 Income" : "💸 Expense";

  const modal = new ModalBuilder()
    .setCustomId(`${FINLOG_MODAL_ID}:${selectedCategory.id}:${selectedType}`)
    .setTitle(`${typeLabel} - ${selectedCategory.name}`);

  const dateInput = new TextInputBuilder()
    .setCustomId("date")
    .setLabel("Date (YYYY-MM-DD)")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("2025-12-27")
    .setValue(new Date().toISOString().split('T')[0])
    .setRequired(true);

  const amountInput = new TextInputBuilder()
    .setCustomId("amount")
    .setLabel("Amount")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("1000.00")
    .setRequired(true);

  const notesInput = new TextInputBuilder()
    .setCustomId("notes")
    .setLabel("Notes (optional)")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Additional details...")
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(dateInput),
    new ActionRowBuilder().addComponents(amountInput),
    new ActionRowBuilder().addComponents(notesInput)
  );

  await interaction.showModal(modal);
}

module.exports = { showFinLogModal };
