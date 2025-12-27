const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const {
  HR_REVIEW_CHANNEL_ID,
  HR_APPROVER_ROLE_ID,
  BUTTON_ACTIONS
} = require("../constants/hr.constants");

function buildApprovalButtons(requestId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`leave:${BUTTON_ACTIONS.APPROVE}:${requestId}`)
      .setLabel("Approve")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`leave:${BUTTON_ACTIONS.REJECT}:${requestId}`)
      .setLabel("Reject")
      .setStyle(ButtonStyle.Danger)
  );
}

async function handleLeaveButtons(interaction) {
  if (!interaction.member.roles.cache.has(HR_APPROVER_ROLE_ID)) {
    return interaction.reply({
      content: "❌ You are not authorized to approve or reject leave.",
      ephemeral: true
    });
  }

  const [, action] = interaction.customId.split(":");

  const statusMessage =
    action === BUTTON_ACTIONS.APPROVE
      ? `✅ **Approved** by ${interaction.user.username}`
      : `❌ **Rejected** by ${interaction.user.username}`;

  await interaction.update({
    content: statusMessage,
    components: []
  });

  // TODO: persist decision to DB / notify employee
}

module.exports = {
  buildApprovalButtons,
  handleLeaveButtons
};
