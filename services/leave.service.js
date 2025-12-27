const crypto = require("crypto");

function createLeaveRequest(interaction) {
  return {
    requestId: crypto.randomUUID(),
    employeeId: interaction.user.id,
    employeeName: interaction.user.username,
    leaveType: interaction.fields.getTextInputValue("leaveType"),
    startDate: interaction.fields.getTextInputValue("startDate"),
    endDate: interaction.fields.getTextInputValue("endDate"),
    reason: interaction.fields.getTextInputValue("reason"),
    status: "PENDING",
    submittedAt: new Date().toISOString()
  };
}

function formatLeaveMessage(leave) {
  return (
    `📄 **Leave Request**\n` +
    `👤 **Employee:** ${leave.employeeName}\n` +
    `📌 **Type:** ${leave.leaveType}\n` +
    `🗓 **Dates:** ${leave.startDate} → ${leave.endDate}\n` +
    `📝 **Reason:** ${leave.reason || "N/A"}\n` +
    `⏳ **Status:** Pending Approval`
  );
}

module.exports = {
  createLeaveRequest,
  formatLeaveMessage
};
