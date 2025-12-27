const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");

const { LEAVE_MODAL_ID } = require("../constants/hr.constants");

async function showLeaveModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId(LEAVE_MODAL_ID)
    .setTitle("Leave Request");

  const leaveTypeInput = new TextInputBuilder()
    .setCustomId("leaveType")
    .setLabel("Leave Type (Annual / Sick / Other)")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const startDateInput = new TextInputBuilder()
    .setCustomId("startDate")
    .setLabel("Start Date (YYYY-MM-DD)")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const endDateInput = new TextInputBuilder()
    .setCustomId("endDate")
    .setLabel("End Date (YYYY-MM-DD)")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const reasonInput = new TextInputBuilder()
    .setCustomId("reason")
    .setLabel("Reason (optional)")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(leaveTypeInput),
    new ActionRowBuilder().addComponents(startDateInput),
    new ActionRowBuilder().addComponents(endDateInput),
    new ActionRowBuilder().addComponents(reasonInput)
  );

  await interaction.showModal(modal);
}

module.exports = { showLeaveModal };
