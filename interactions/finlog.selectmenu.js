const {
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

const { fetchCategories } = require("../services/api.service");
const { showFinLogModal } = require("./finlog.modal");

async function handleFinLogSelectMenu(interaction) {
  const selectedCategoryId = interaction.values[0];

  // Fetch categories to get the name
  const categories = await fetchCategories();
  const selectedCategory = categories.find(cat => cat.id.toString() === selectedCategoryId);

  if (!selectedCategory) {
    return interaction.reply({
      content: "❌ Category not found.",
      ephemeral: true
    });
  }

  // Show type selection menu
  const typeSelect = new StringSelectMenuBuilder()
    .setCustomId(`finlog:select_type:${selectedCategory.id}:${selectedCategory.name}`)
    .setPlaceholder("Select transaction type...")
    .addOptions([
      {
        label: "💰 Income",
        description: "Money received or earned",
        value: "income"
      },
      {
        label: "💸 Expense",
        description: "Money spent or paid out",
        value: "expense"
      }
    ]);

  const row = new ActionRowBuilder().addComponents(typeSelect);

  await interaction.update({
    content: `📁  **Category:**  ${selectedCategory.name}\n\n📊  **Select transaction type:**`,
    components: [row]
  });
}

async function handleFinLogTypeSelectMenu(interaction) {
  // Parse customId: finlog:select_type:categoryId:categoryName
  const [, , categoryId, categoryName] = interaction.customId.split(":");
  const selectedType = interaction.values[0];

  const selectedCategory = {
    id: categoryId,
    name: categoryName
  };

  // Show the modal with category and type
  await showFinLogModal(interaction, selectedCategory, selectedType);
}

module.exports = {
  handleFinLogSelectMenu,
  handleFinLogTypeSelectMenu
};
