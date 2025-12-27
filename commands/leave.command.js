const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Request leave"),

  async execute(interaction) {
    const { showLeaveModal } = require("../interactions/leave.modal");
    await showLeaveModal(interaction);
  }
};
