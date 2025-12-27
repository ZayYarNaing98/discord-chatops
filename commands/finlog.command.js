const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const { fetchCategories } = require("../services/api.service");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("finlog")
    .setDescription("Log daily income or outcome"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const categories = await fetchCategories();

    if (!categories || categories.length === 0) {
      return interaction.editReply({
        content: "❌ Unable to fetch categories. Please try again later."
      });
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("finlog:select_category")
      .setPlaceholder("Choose a category")
      .addOptions(
        categories.map(cat => ({
          label: cat.name,
          value: cat.id.toString()
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.editReply({
      content: "Please select a category for your financial log:",
      components: [row]
    });
  }
};
