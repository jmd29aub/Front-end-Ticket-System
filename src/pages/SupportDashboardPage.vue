<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
// @ts-ignore
import html2pdf from "html2pdf.js";
import ExcelJS from "exceljs";
import AccentLine from "@/components/layout/AccentLine/AccentLine.vue";
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";
import SupportTicketTable from "@/components/tickets/SupportTicketTable/SupportTicketTable.vue";
import TicketFilters from "@/components/tickets/TicketFilters/TicketFilters.vue";

type SupportStatus = "Open" | "In Progress" | "Resolved" | "Waiting for Client";
type SupportPriority = "High" | "Medium" | "Low";
type ExportFormat = "pdf" | "excel";

interface SupportTicket {
  id: string;
  client: string;
  subject: string;
  priority: SupportPriority;
  status: SupportStatus;
  assignedTo: string;
  category: string;
  date: string;
}

const router = useRouter();

const isSidebarOpen = ref(false);

const searchQuery = ref("");
const selectedStatus = ref("");
const selectedPriority = ref("");
const selectedCategory = ref("");
const selectedAgent = ref("");

const showExportModal = ref(false);
const isExportingReport = ref(false);
const exportError = ref("");
const selectedExportFormat = ref<ExportFormat>("pdf");

const supportTickets: SupportTicket[] = [
  {
    id: "#1025",
    client: "Joe Dib",
    subject: "Login issue",
    priority: "High",
    status: "In Progress",
    assignedTo: "John Doe",
    category: "Account Access",
    date: "Sept 20, 2025",
  },
  {
    id: "#1024",
    client: "Joe Dib",
    subject: "Billing issue",
    priority: "Medium",
    status: "Open",
    assignedTo: "John Doe",
    category: "Billing",
    date: "Yesterday",
  },
  {
    id: "#1023",
    client: "Joe Dib",
    subject: "Feature request",
    priority: "Low",
    status: "Waiting for Client",
    assignedTo: "Support Team",
    category: "Feature Request",
    date: "Today",
  },
  {
    id: "#1022",
    client: "Joe Dib",
    subject: "Login issue",
    priority: "High",
    status: "Resolved",
    assignedTo: "Sarah Smith",
    category: "Account Access",
    date: "Today",
  },
];

const filteredSupportTickets = computed(() => {
  const searchValue = searchQuery.value.trim().toLowerCase();

  return supportTickets.filter((ticket) => {
    const searchableText = [
      ticket.id,
      ticket.client,
      ticket.subject,
      ticket.priority,
      ticket.status,
      ticket.assignedTo,
      ticket.category,
      ticket.date,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !searchValue || searchableText.includes(searchValue);
    const matchesStatus = !selectedStatus.value || ticket.status === selectedStatus.value;
    const matchesPriority = !selectedPriority.value || ticket.priority === selectedPriority.value;
    const matchesCategory = !selectedCategory.value || ticket.category === selectedCategory.value;
    const matchesAgent = !selectedAgent.value || ticket.assignedTo === selectedAgent.value;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAgent;
  });
});

const hasActiveFilters = computed(() => {
  return Boolean(
    searchQuery.value.trim() ||
    selectedStatus.value ||
    selectedPriority.value ||
    selectedCategory.value ||
    selectedAgent.value,
  );
});

const exportTicketCount = computed(() => filteredSupportTickets.value.length);

const exportFilterMessage = computed(() => {
  if (hasActiveFilters.value) {
    return "Only the tickets matching your current filters will be included in the report.";
  }

  return "No filters are currently applied. The report will include all tickets. You can cancel if you want to add filters first.";
});

const exportButtonText = computed(() => {
  if (isExportingReport.value) {
    return "Exporting...";
  }

  return selectedExportFormat.value === "pdf" ? "Yes, Export PDF" : "Yes, Export Excel";
});

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

function handleSignOut() {
  router.push({ name: "login" });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getActiveFilters() {
  const filters = [
    searchQuery.value ? `Search: ${searchQuery.value}` : "",
    selectedStatus.value ? `Status: ${selectedStatus.value}` : "",
    selectedPriority.value ? `Priority: ${selectedPriority.value}` : "",
    selectedCategory.value ? `Category: ${selectedCategory.value}` : "",
    selectedAgent.value ? `Agent: ${selectedAgent.value}` : "",
  ].filter(Boolean);

  return filters.length > 0 ? filters : ["No filters applied"];
}

function getStatusClass(status: SupportStatus) {
  return `status-${status.toLowerCase().replaceAll(" ", "-")}`;
}

function getPriorityClass(priority: SupportPriority) {
  return `priority-${priority.toLowerCase()}`;
}

function buildReportHtml(
  ticketsToExport: SupportTicket[],
  activeFilters: string[],
  generatedDate: string,
) {
  const openCount = ticketsToExport.filter((ticket) => ticket.status === "Open").length;
  const inProgressCount = ticketsToExport.filter(
    (ticket) => ticket.status === "In Progress",
  ).length;
  const resolvedCount = ticketsToExport.filter((ticket) => ticket.status === "Resolved").length;
  const waitingCount = ticketsToExport.filter(
    (ticket) => ticket.status === "Waiting for Client",
  ).length;

  return `
    <div class="pdf-report">
      <style>
        * {
          box-sizing: border-box;
        }

        .pdf-report {
          width: 297mm;
          min-height: 210mm;
          background: #ffffff;
          color: #111827;
          font-family: Inter, Arial, sans-serif;
          padding: 10mm;
          box-sizing: border-box;
        }

        .report-card {
          width: 100%;
          min-height: 190mm;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #ffffff;
          overflow: hidden;
        }

        .accent-line {
          height: 8px;
          background: #a81aea;
        }

        .report-header {
          padding: 22px 26px 18px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          border-bottom: 1px solid #e5e7eb;
          background: #ffffff;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .brand-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #a81aea;
        }

        .brand-name {
          font-size: 16px;
          font-weight: 800;
          color: #111827;
        }

        .report-title {
          margin: 0;
          color: #111827;
          font-size: 28px;
          font-weight: 900;
          line-height: 1.1;
        }

        .report-subtitle {
          margin: 10px 0 0;
          color: #6b7280;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.45;
        }

        .meta-card {
          width: 250px;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f5f7fa;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          color: #6b7280;
          font-size: 11px;
          font-weight: 800;
          line-height: 1.9;
        }

        .meta-row strong {
          color: #111827;
          font-weight: 900;
        }

        .summary {
          padding: 20px 26px 14px;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }

        .summary-card {
          min-height: 72px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #ffffff;
          padding: 13px 14px;
        }

        .summary-card span {
          display: block;
          color: #6b7280;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .summary-card strong {
          display: block;
          margin-top: 9px;
          color: #111827;
          font-size: 25px;
          font-weight: 900;
          line-height: 1;
        }

        .filters {
          margin: 0 26px 16px;
          padding: 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f5f7fa;
        }

        .section-title {
          margin: 0 0 10px;
          color: #111827;
          font-size: 15px;
          font-weight: 900;
        }

        .filter-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .filter-chip {
          min-height: 24px;
          padding: 0 10px;
          border-radius: 999px;
          background: rgba(168, 26, 234, 0.1);
          color: #a81aea;
          font-size: 10px;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
        }

        .filter-chip--muted {
          background: rgba(107, 114, 128, 0.12);
          color: #6b7280;
        }

        .table-section {
          padding: 0 26px 18px;
        }

        .table-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          background: #ffffff;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        th {
          background: #f5f7fa;
          color: #6b7280;
          font-size: 10px;
          font-weight: 900;
          text-align: left;
          padding: 10px 8px;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap;
        }

        td {
          color: #111827;
          font-size: 10px;
          font-weight: 700;
          padding: 11px 8px;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: middle;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        tr:last-child td {
          border-bottom: none;
        }

        .col-id {
          width: 9%;
        }

        .col-client {
          width: 12%;
        }

        .col-subject {
          width: 17%;
        }

        .col-priority {
          width: 11%;
        }

        .col-status {
          width: 16%;
        }

        .col-agent {
          width: 13%;
        }

        .col-category {
          width: 13%;
        }

        .col-date {
          width: 9%;
        }

        .badge {
          min-height: 22px;
          min-width: 72px;
          padding: 0 9px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
        }

        .priority-high {
          background: rgba(229, 0, 0, 0.1);
          color: #e50000;
        }

        .priority-medium {
          background: rgba(255, 150, 69, 0.14);
          color: #ff9645;
        }

        .priority-low {
          background: rgba(39, 198, 99, 0.12);
          color: #27c663;
        }

        .status-open {
          background: rgba(168, 26, 234, 0.1);
          color: #a81aea;
        }

        .status-in-progress {
          background: rgba(255, 150, 69, 0.14);
          color: #ff9645;
        }

        .status-resolved {
          background: rgba(39, 198, 99, 0.12);
          color: #27c663;
        }

        .status-waiting-for-client {
          min-width: 98px;
          background: rgba(107, 114, 128, 0.12);
          color: #6b7280;
        }

        .footer {
          padding: 12px 26px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 10px;
          font-weight: 700;
          text-align: center;
          background: #fafafa;
        }
      </style>

      <main class="report-card">
        <div class="accent-line"></div>

        <section class="report-header">
          <div>
            <div class="brand">
              <div class="brand-icon"></div>
              <span class="brand-name">Support Ticket System</span>
            </div>

            <h1 class="report-title">Support Ticket Report</h1>

            <p class="report-subtitle">
              A clean A4 export of the current support dashboard ticket view.
            </p>
          </div>

          <aside class="meta-card">
            <div class="meta-row">
              <span>Generated</span>
              <strong>${generatedDate}</strong>
            </div>

            <div class="meta-row">
              <span>Total Tickets</span>
              <strong>${ticketsToExport.length}</strong>
            </div>

            <div class="meta-row">
              <span>Filters Applied</span>
              <strong>${hasActiveFilters.value ? "Yes" : "No"}</strong>
            </div>
          </aside>
        </section>

        <section class="summary">
          <article class="summary-card">
            <span>Total</span>
            <strong>${ticketsToExport.length}</strong>
          </article>

          <article class="summary-card">
            <span>Open</span>
            <strong>${openCount}</strong>
          </article>

          <article class="summary-card">
            <span>In Progress</span>
            <strong>${inProgressCount}</strong>
          </article>

          <article class="summary-card">
            <span>Waiting</span>
            <strong>${waitingCount}</strong>
          </article>

          <article class="summary-card">
            <span>Resolved</span>
            <strong>${resolvedCount}</strong>
          </article>
        </section>

        <section class="filters">
          <h2 class="section-title">Applied Filters</h2>

          <div class="filter-list">
            ${activeFilters
              .map((filter) => {
                const mutedClass = filter === "No filters applied" ? " filter-chip--muted" : "";

                return `<span class="filter-chip${mutedClass}">${escapeHtml(filter)}</span>`;
              })
              .join("")}
          </div>
        </section>

        <section class="table-section">
          <h2 class="section-title">Ticket List</h2>

          <div class="table-card">
            <table>
              <thead>
                <tr>
                  <th class="col-id">Ticket ID</th>
                  <th class="col-client">Client</th>
                  <th class="col-subject">Subject</th>
                  <th class="col-priority">Priority</th>
                  <th class="col-status">Status</th>
                  <th class="col-agent">Assigned To</th>
                  <th class="col-category">Category</th>
                  <th class="col-date">Date</th>
                </tr>
              </thead>

              <tbody>
                ${ticketsToExport
                  .map((ticket) => {
                    return `
                      <tr>
                        <td class="col-id">${escapeHtml(ticket.id)}</td>
                        <td class="col-client">${escapeHtml(ticket.client)}</td>
                        <td class="col-subject">${escapeHtml(ticket.subject)}</td>
                        <td class="col-priority">
                          <span class="badge ${getPriorityClass(ticket.priority)}">
                            ${escapeHtml(ticket.priority)}
                          </span>
                        </td>
                        <td class="col-status">
                          <span class="badge ${getStatusClass(ticket.status)}">
                            ${escapeHtml(ticket.status)}
                          </span>
                        </td>
                        <td class="col-agent">${escapeHtml(ticket.assignedTo)}</td>
                        <td class="col-category">${escapeHtml(ticket.category)}</td>
                        <td class="col-date">${escapeHtml(ticket.date)}</td>
                      </tr>
                    `;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
        </section>

        <footer class="footer">
          This PDF was generated from the Support Ticket System dashboard.
        </footer>
      </main>
    </div>
  `;
}

function getExcelStatusColors(status: SupportStatus) {
  if (status === "Open") {
    return { fill: "F3D9FF", font: "A81AEA" };
  }

  if (status === "In Progress") {
    return { fill: "FFF0E6", font: "FF9645" };
  }

  if (status === "Resolved") {
    return { fill: "E6F8EE", font: "27C663" };
  }

  return { fill: "EEF0F3", font: "6B7280" };
}

function getExcelPriorityColors(priority: SupportPriority) {
  if (priority === "High") {
    return { fill: "FCE5E5", font: "E50000" };
  }

  if (priority === "Medium") {
    return { fill: "FFF0E6", font: "FF9645" };
  }

  return { fill: "E6F8EE", font: "27C663" };
}

function addThinBorder(cell: ExcelJS.Cell) {
  cell.border = {
    top: { style: "thin", color: { argb: "FFE5E7EB" } },
    left: { style: "thin", color: { argb: "FFE5E7EB" } },
    bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
    right: { style: "thin", color: { argb: "FFE5E7EB" } },
  };
}

async function downloadExcelReport(
  ticketsToExport: SupportTicket[],
  activeFilters: string[],
  generatedDate: string,
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Support Report");

  workbook.creator = "Support Ticket System";
  workbook.created = new Date();

  worksheet.properties.defaultRowHeight = 22;

  worksheet.columns = [
    { key: "id", width: 14 },
    { key: "client", width: 18 },
    { key: "subject", width: 28 },
    { key: "priority", width: 16 },
    { key: "status", width: 22 },
    { key: "assignedTo", width: 20 },
    { key: "category", width: 22 },
    { key: "date", width: 16 },
  ];

  worksheet.mergeCells("A1:H1");
  const titleCell = worksheet.getCell("A1");

  titleCell.value = "Support Ticket Report";
  titleCell.font = {
    name: "Arial",
    size: 20,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFA81AEA" },
  };
  titleCell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  worksheet.getRow(1).height = 36;

  worksheet.mergeCells("A2:H2");
  const subtitleCell = worksheet.getCell("A2");

  subtitleCell.value = `Generated: ${generatedDate}   |   Filters Applied: ${
    hasActiveFilters.value ? "Yes" : "No"
  }   |   Tickets: ${ticketsToExport.length}`;
  subtitleCell.font = {
    name: "Arial",
    size: 11,
    bold: true,
    color: { argb: "FF6B7280" },
  };
  subtitleCell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  worksheet.getRow(2).height = 26;

  worksheet.mergeCells("A4:H4");
  const filtersCell = worksheet.getCell("A4");

  filtersCell.value = `Applied Filters: ${activeFilters.join(", ")}`;
  filtersCell.font = {
    name: "Arial",
    size: 11,
    bold: true,
    color: { argb: hasActiveFilters.value ? "FFA81AEA" : "FF6B7280" },
  };
  filtersCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: hasActiveFilters.value ? "FFF3D9FF" : "FFF5F7FA" },
  };
  filtersCell.alignment = {
    vertical: "middle",
    horizontal: "left",
  };
  addThinBorder(filtersCell);
  worksheet.getRow(4).height = 28;

  const openCount = ticketsToExport.filter((ticket) => ticket.status === "Open").length;
  const inProgressCount = ticketsToExport.filter(
    (ticket) => ticket.status === "In Progress",
  ).length;
  const waitingCount = ticketsToExport.filter(
    (ticket) => ticket.status === "Waiting for Client",
  ).length;
  const resolvedCount = ticketsToExport.filter((ticket) => ticket.status === "Resolved").length;

  const summaryCards = [
    {
      label: "Total",
      value: ticketsToExport.length,
      labelRange: "A6:B6",
      valueRange: "A7:B7",
      labelCell: "A6",
      valueCell: "A7",
    },
    {
      label: "Open",
      value: openCount,
      labelRange: "C6:C6",
      valueRange: "C7:C7",
      labelCell: "C6",
      valueCell: "C7",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      labelRange: "D6:E6",
      valueRange: "D7:E7",
      labelCell: "D6",
      valueCell: "D7",
    },
    {
      label: "Waiting",
      value: waitingCount,
      labelRange: "F6:F6",
      valueRange: "F7:F7",
      labelCell: "F6",
      valueCell: "F7",
    },
    {
      label: "Resolved",
      value: resolvedCount,
      labelRange: "G6:H6",
      valueRange: "G7:H7",
      labelCell: "G6",
      valueCell: "G7",
    },
  ];

  summaryCards.forEach((card) => {
    worksheet.mergeCells(card.labelRange);
    worksheet.mergeCells(card.valueRange);

    const labelCell = worksheet.getCell(card.labelCell);
    const valueCell = worksheet.getCell(card.valueCell);

    labelCell.value = card.label;
    labelCell.font = {
      name: "Arial",
      size: 10,
      bold: true,
      color: { argb: "FF6B7280" },
    };
    labelCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF5F7FA" },
    };
    labelCell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    addThinBorder(labelCell);

    valueCell.value = card.value;
    valueCell.font = {
      name: "Arial",
      size: 18,
      bold: true,
      color: { argb: "FF111827" },
    };
    valueCell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    addThinBorder(valueCell);
  });

  worksheet.getRow(6).height = 24;
  worksheet.getRow(7).height = 30;

  worksheet.mergeCells("A9:H9");
  const tableTitleCell = worksheet.getCell("A9");

  tableTitleCell.value = "Ticket List";
  tableTitleCell.font = {
    name: "Arial",
    size: 13,
    bold: true,
    color: { argb: "FF111827" },
  };
  tableTitleCell.alignment = {
    horizontal: "left",
    vertical: "middle",
  };
  worksheet.getRow(9).height = 24;

  const headerRow = worksheet.getRow(10);

  headerRow.values = [
    "Ticket ID",
    "Client",
    "Subject",
    "Priority",
    "Status",
    "Assigned To",
    "Category",
    "Date",
  ];
  headerRow.height = 26;

  headerRow.eachCell((cell) => {
    cell.font = {
      name: "Arial",
      size: 11,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFA81AEA" },
    };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FFA81AEA" } },
      left: { style: "thin", color: { argb: "FFA81AEA" } },
      bottom: { style: "thin", color: { argb: "FFA81AEA" } },
      right: { style: "thin", color: { argb: "FFA81AEA" } },
    };
  });

  ticketsToExport.forEach((ticket, index) => {
    const row = worksheet.addRow([
      ticket.id,
      ticket.client,
      ticket.subject,
      ticket.priority,
      ticket.status,
      ticket.assignedTo,
      ticket.category,
      ticket.date,
    ]);

    row.height = 26;

    row.eachCell((cell) => {
      cell.font = {
        name: "Arial",
        size: 10,
        bold: true,
        color: { argb: "FF111827" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "left",
      };
      addThinBorder(cell);

      if (index % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFAFAFA" },
        };
      }
    });

    const priorityCell = row.getCell(4);
    const priorityColors = getExcelPriorityColors(ticket.priority);

    priorityCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${priorityColors.fill}` },
    };
    priorityCell.font = {
      name: "Arial",
      size: 10,
      bold: true,
      color: { argb: `FF${priorityColors.font}` },
    };
    priorityCell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    const statusCell = row.getCell(5);
    const statusColors = getExcelStatusColors(ticket.status);

    statusCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${statusColors.fill}` },
    };
    statusCell.font = {
      name: "Arial",
      size: 10,
      bold: true,
      color: { argb: `FF${statusColors.font}` },
    };
    statusCell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };
  });

  worksheet.autoFilter = {
    from: "A10",
    to: "H10",
  };

  const fileDate = new Date().toISOString().slice(0, 10);
  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `support-ticket-report-${fileDate}.xlsx`;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function handleExportReport() {
  exportError.value = "";
  selectedExportFormat.value = "pdf";

  if (filteredSupportTickets.value.length === 0) {
    exportError.value = "No tickets match your current filters.";
    showExportModal.value = true;
    return;
  }

  showExportModal.value = true;
}

function handleCancelExport() {
  if (isExportingReport.value) {
    return;
  }

  showExportModal.value = false;
  exportError.value = "";
}

async function handleConfirmExport() {
  const ticketsToExport = filteredSupportTickets.value;

  if (ticketsToExport.length === 0) {
    exportError.value = "No tickets match your current filters.";
    return;
  }

  isExportingReport.value = true;
  exportError.value = "";

  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const activeFilters = getActiveFilters();

  if (selectedExportFormat.value === "excel") {
    try {
      await downloadExcelReport(ticketsToExport, activeFilters, generatedDate);
      showExportModal.value = false;
    } catch (error) {
      exportError.value = "Something went wrong while exporting the Excel file.";
    } finally {
      isExportingReport.value = false;
    }

    return;
  }

  const reportElement = document.createElement("div");

  reportElement.style.position = "absolute";
  reportElement.style.left = "0";
  reportElement.style.top = "0";
  reportElement.style.width = "297mm";
  reportElement.style.backgroundColor = "#ffffff";
  reportElement.style.zIndex = "-1";
  reportElement.style.pointerEvents = "none";

  reportElement.innerHTML = buildReportHtml(ticketsToExport, activeFilters, generatedDate);

  document.body.appendChild(reportElement);

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 300);
  });

  const pdfReport = reportElement.querySelector(".pdf-report") as HTMLElement | null;

  if (!pdfReport) {
    exportError.value = "Report layout could not be created.";
    document.body.removeChild(reportElement);
    isExportingReport.value = false;
    return;
  }

  try {
    const fileDate = new Date().toISOString().slice(0, 10);

    await html2pdf()
      .set({
        margin: 0,
        filename: `support-ticket-report-${fileDate}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "landscape",
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
        },
      })
      .from(pdfReport)
      .save();

    showExportModal.value = false;
  } catch (error) {
    exportError.value = "Something went wrong while exporting the PDF.";
  } finally {
    document.body.removeChild(reportElement);
    isExportingReport.value = false;
  }
}

function handleViewAllTickets() {
  searchQuery.value = "";
  selectedStatus.value = "";
  selectedPriority.value = "";
  selectedCategory.value = "";
  selectedAgent.value = "";
}

function handleViewTicket(ticketId: string) {
  const cleanTicketId = ticketId.replace("#", "");
  router.push({ name: "support-ticket-details", params: { id: cleanTicketId } });
}
</script>

<template>
  <main class="support-dashboard">
    <section
      class="support-dashboard__shell"
      :class="{ 'support-dashboard__shell--collapsed': !isSidebarOpen }"
    >
      <header class="support-dashboard__sidebar-header">
        <div class="support-dashboard__brand-group">
          <div class="support-dashboard__headset-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4 13V11C4 6.6 7.6 3 12 3C16.4 3 20 6.6 20 11V13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />

              <path
                d="M4 13C4 12.4 4.4 12 5 12H7C7.6 12 8 12.4 8 13V17C8 17.6 7.6 18 7 18H5C4.4 18 4 17.6 4 17V13Z"
                stroke="currentColor"
                stroke-width="2"
              />

              <path
                d="M16 13C16 12.4 16.4 12 17 12H19C19.6 12 20 12.4 20 13V17C20 17.6 19.6 18 19 18H17C16.4 18 16 17.6 16 17V13Z"
                stroke="currentColor"
                stroke-width="2"
              />

              <path
                d="M20 17V18C20 19.7 18.7 21 17 21H13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>

          <h1 class="support-dashboard__brand">Support Ticket System</h1>
        </div>
      </header>

      <header class="support-dashboard__topbar">
        <div class="support-dashboard__top-actions">
          <button class="support-dashboard__notification" type="button">
            <AppIcon name="notification" :size="22" />
            <span>3</span>
          </button>

          <a href="#" class="support-dashboard__profile">Profile</a>

          <button class="support-dashboard__sign-out" type="button" @click="handleSignOut">
            <AppIcon name="sign-out" :size="18" />
            Sign Out
          </button>
        </div>
      </header>

      <AccentLine class="support-dashboard__accent-line" />

      <button
        class="support-dashboard__sidebar-toggle"
        type="button"
        :aria-label="isSidebarOpen ? 'Collapse sidebar' : 'Open sidebar'"
        @click="toggleSidebar"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <aside class="support-dashboard__sidebar">
        <nav class="support-dashboard__sidebar-nav">
          <a href="#" class="support-dashboard__sidebar-link" title="Assigned to Me">
            <span class="support-dashboard__sidebar-icon">
              <AppIcon name="user" :size="22" />
            </span>

            <span class="support-dashboard__sidebar-text">Assigned to Me</span>
          </a>

          <a href="#" class="support-dashboard__sidebar-link" title="Overdue Tickets">
            <span class="support-dashboard__sidebar-icon">
              <AppIcon name="clock" :size="22" />
            </span>

            <span class="support-dashboard__sidebar-text">Overdue Tickets</span>
          </a>

          <a href="#" class="support-dashboard__sidebar-link" title="Resolved Tickets">
            <span class="support-dashboard__sidebar-icon">
              <AppIcon name="check" :size="22" />
            </span>

            <span class="support-dashboard__sidebar-text">Resolved Tickets</span>
          </a>

          <a href="#" class="support-dashboard__sidebar-link" title="Clients">
            <span class="support-dashboard__sidebar-icon">
              <AppIcon name="clients" :size="22" />
            </span>

            <span class="support-dashboard__sidebar-text">Clients</span>
          </a>

          <a href="#" class="support-dashboard__sidebar-link" title="Settings">
            <span class="support-dashboard__sidebar-icon">
              <AppIcon name="settings" :size="22" />
            </span>

            <span class="support-dashboard__sidebar-text">Settings</span>
          </a>
        </nav>
      </aside>

      <section class="support-dashboard__content">
        <section class="support-dashboard__header">
          <div>
            <h2 class="support-dashboard__title">Support Dashboard</h2>

            <p class="support-dashboard__subtitle">
              Manage, prioritize, and resolve client support tickets.
            </p>
          </div>

          <button
            class="support-dashboard__export-button"
            type="button"
            @click="handleExportReport"
          >
            <AppIcon name="export" :size="17" />
            Export Report
          </button>
        </section>

        <section class="support-dashboard__stats">
          <article class="support-dashboard__stat-card">
            <div class="support-dashboard__stat-icon">
              <AppIcon name="tickets" :size="29" />
            </div>

            <div>
              <p>Open Tickets</p>
              <strong>12</strong>
            </div>
          </article>

          <article class="support-dashboard__stat-card">
            <div class="support-dashboard__stat-icon support-dashboard__stat-icon--urgent">
              <AppIcon name="alert" :size="29" />
            </div>

            <div>
              <p>Urgent Tickets</p>
              <strong>3</strong>
            </div>
          </article>

          <article class="support-dashboard__stat-card">
            <div class="support-dashboard__stat-icon">
              <AppIcon name="user" :size="29" />
            </div>

            <div>
              <p>Assigned to Me</p>
              <strong>5</strong>
            </div>
          </article>
        </section>

        <TicketFilters
          v-model:search="searchQuery"
          v-model:status="selectedStatus"
          v-model:priority="selectedPriority"
          v-model:category="selectedCategory"
          v-model:agent="selectedAgent"
        />

        <section class="support-dashboard__table-card">
          <SupportTicketTable :tickets="filteredSupportTickets" @view-ticket="handleViewTicket" />

          <p v-if="filteredSupportTickets.length === 0" class="support-dashboard__empty">
            No tickets match your filters.
          </p>

          <button class="support-dashboard__view-all" type="button" @click="handleViewAllTickets">
            View all tickets
            <span>→</span>
          </button>
        </section>
      </section>
    </section>

    <div
      v-if="showExportModal"
      class="support-dashboard__export-modal-backdrop"
      @click.self="handleCancelExport"
    >
      <section class="support-dashboard__export-modal">
        <div class="support-dashboard__export-modal-icon">
          <AppIcon name="export" :size="26" />
        </div>

        <h3>Export support report?</h3>

        <p>
          {{ exportFilterMessage }}
        </p>

        <div class="support-dashboard__export-format-group">
          <button
            class="support-dashboard__export-format"
            :class="{ 'support-dashboard__export-format--active': selectedExportFormat === 'pdf' }"
            type="button"
            :disabled="isExportingReport"
            @click="selectedExportFormat = 'pdf'"
          >
            <strong>PDF</strong>
            <span>Clean A4 report</span>
          </button>

          <button
            class="support-dashboard__export-format"
            :class="{
              'support-dashboard__export-format--active': selectedExportFormat === 'excel',
            }"
            type="button"
            :disabled="isExportingReport"
            @click="selectedExportFormat = 'excel'"
          >
            <strong>Excel</strong>
            <span>Designed spreadsheet</span>
          </button>
        </div>

        <div class="support-dashboard__export-modal-summary">
          <span>Tickets to export</span>
          <strong>{{ exportTicketCount }}</strong>
        </div>

        <p v-if="exportError" class="support-dashboard__export-error">
          {{ exportError }}
        </p>

        <div class="support-dashboard__export-modal-actions">
          <button
            class="support-dashboard__export-cancel"
            type="button"
            :disabled="isExportingReport"
            @click="handleCancelExport"
          >
            Cancel
          </button>

          <button
            class="support-dashboard__export-confirm"
            type="button"
            :disabled="isExportingReport || exportTicketCount === 0"
            @click="handleConfirmExport"
          >
            {{ exportButtonText }}
          </button>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use "@/styles/variables" as *;

.support-dashboard {
  min-height: 100vh;
  background-color: $color-background;
  padding: 0;
  display: block;
  box-sizing: border-box;

  &__shell {
    position: relative;
    width: 100%;
    min-height: 100vh;
    background-color: $color-background;
    display: grid;
    grid-template-columns: 258px 1fr;
    grid-template-rows: $navbar-height $accent-line-height 1fr;
    transition: grid-template-columns 0.25s ease;

    &--collapsed {
      grid-template-columns: 88px 1fr;

      .support-dashboard__sidebar-header {
        padding: 0;
        justify-content: center;
        overflow: visible;
      }

      .support-dashboard__brand-group {
        justify-content: center;
      }

      .support-dashboard__brand {
        position: absolute;
        top: calc(#{$navbar-height} / 2);
        left: 120px;
        margin: 0;
        display: block;
        font-family: $font-main;
        color: $color-main-text;
        font-size: $font-size-md;
        font-weight: 700;
        line-height: 1.2;
        white-space: nowrap;
        transform: translateY(-50%);
        z-index: 60;
      }

      .support-dashboard__sidebar-toggle {
        left: 23px;
      }

      .support-dashboard__sidebar-nav {
        padding-top: 90px;
        gap: 28px;
        align-items: center;
      }

      .support-dashboard__sidebar-link {
        width: 44px;
        height: 44px;
        padding: 0;
        justify-content: center;
        border-radius: $radius-md;
        gap: 0;

        &:hover {
          background-color: rgba($color-secondary, 0.08);
        }
      }

      .support-dashboard__sidebar-icon {
        width: 44px;
        color: $color-secondary;
      }

      .support-dashboard__sidebar-text {
        display: none;
      }

      .support-dashboard__content {
        padding-left: $page-padding-x;
        padding-right: $page-padding-x;
      }

      .support-dashboard__stat-card {
        justify-content: flex-start;
        padding-left: 34px;
        padding-right: 24px;
        box-sizing: border-box;
      }

      .support-dashboard__export-button {
        min-width: $button-min-width;
        height: $button-height;
        background-color: $color-primary;
        border-color: $color-secondary;
        color: $color-secondary;

        &:hover {
          background-color: rgba($color-secondary, 0.06);
        }
      }
    }
  }

  &__sidebar-header {
    grid-column: 1;
    grid-row: 1;
    background-color: $color-surface;
    border-right: 1px solid $color-border;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: $space-sm;
    padding: 0 10px;
    box-sizing: border-box;
    overflow: hidden;
    z-index: 30;
  }

  &__brand-group {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  &__headset-icon {
    width: 32px;
    height: 32px;
    border-radius: $radius-md;
    background-color: $color-secondary;
    color: $color-primary;
    display: grid;
    place-items: center;
    flex-shrink: 0;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  &__brand {
    margin: 0;
    font-family: $font-main;
    font-size: $font-size-md;
    font-weight: 700;
    line-height: 1.2;
    color: $color-main-text;
    white-space: nowrap;
  }

  &__sidebar-toggle {
    position: absolute;
    top: calc(#{$navbar-height} + #{$accent-line-height} + 22px);
    left: 237px;
    z-index: 40;
    width: 42px;
    height: 42px;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    background-color: $color-surface;
    color: $color-secondary;
    box-shadow: $shadow-sm;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    transition:
      left 0.25s ease,
      border-color 0.2s ease,
      background-color 0.2s ease,
      box-shadow 0.2s ease;

    span {
      width: 18px;
      height: 2px;
      border-radius: 999px;
      background-color: $color-secondary;
      display: block;
    }

    &:hover {
      border-color: $color-secondary;
      background-color: rgba($color-secondary, 0.06);
      box-shadow: $shadow-md;
    }
  }

  &__topbar {
    grid-column: 2;
    grid-row: 1;
    height: $navbar-height;
    background-color: $color-surface;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 $page-padding-x;
    box-sizing: border-box;
  }

  &__top-actions {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 64px;
  }

  &__notification {
    border: none;
    background: transparent;
    color: $color-main-text;
    cursor: pointer;
    position: relative;
    padding: 0;
    display: grid;
    place-items: center;

    span {
      position: absolute;
      top: -5px;
      right: -8px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: $color-secondary;
      color: $color-primary;
      font-size: 8px;
      font-weight: 800;
      display: grid;
      place-items: center;
    }
  }

  &__profile {
    color: $color-secondary-text;
    text-decoration: none;
    font-size: $font-size-sm;
    font-weight: 600;
  }

  &__sign-out {
    border: none;
    background: transparent;
    color: $color-secondary;
    font-size: $font-size-sm;
    font-weight: 700;
    cursor: pointer;
    padding-left: $space-lg;
    border-left: 1px solid $color-border;
    display: inline-flex;
    align-items: center;
    gap: $space-xs;
    white-space: nowrap;
  }

  &__accent-line {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  &__sidebar {
    grid-column: 1;
    grid-row: 3;
    background-color: $color-surface;
    border-right: 1px solid $color-border;
    overflow: hidden;
  }

  &__sidebar-nav {
    padding-top: 42px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  &__sidebar-link {
    min-height: 44px;
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 0 24px;
    color: $color-main-text;
    text-decoration: none;
    font-size: $font-size-sm;
    font-weight: 600;
    transition: 0.2s ease;
  }

  &__sidebar-icon {
    width: 22px;
    color: $color-secondary-text;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  &__sidebar-text {
    white-space: nowrap;
  }

  &__content {
    grid-column: 2;
    grid-row: 3;
    padding: 48px 32px $space-md;
    box-sizing: border-box;
    transition: padding 0.25s ease;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__export-button {
    min-width: $button-min-width;
    height: $button-height;
    padding: 0 $button-padding-x;
    border-radius: $radius-md;
    border: 1px solid $color-secondary;
    background-color: $color-primary;
    color: $color-secondary;
    font-size: $button-font-size;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: $space-sm;

    &:hover {
      background-color: rgba($color-secondary, 0.06);
    }
  }

  &__title {
    margin: 0;
    color: $color-main-text;
    font-size: 28px;
    font-weight: 800;
  }

  &__subtitle {
    margin: 22px 0 0;
    color: $color-secondary-text;
    font-size: 13px;
    font-weight: 700;
  }

  &__stats {
    margin-top: 50px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 54px;
  }

  &__stat-card {
    min-height: 130px;
    background-color: $color-surface;
    border: $card-border;
    border-radius: $card-radius;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $space-lg;

    p {
      margin: 0 0 $space-sm;
      color: $color-secondary-text;
      font-size: $font-size-sm;
      font-weight: 500;
    }

    strong {
      color: #000000;
      font-size: 34px;
      font-weight: 800;
      line-height: 1;
    }
  }

  &__stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: rgba($color-secondary, 0.12);
    color: $color-secondary;
    display: grid;
    place-items: center;

    &--urgent {
      background-color: rgba($color-danger, 0.16);
      color: $color-danger;
    }
  }

  &__table-card {
    margin-top: $space-sm;
    background-color: $color-surface;
    border: $card-border;
    border-radius: $card-radius;
    padding: 18px 20px 24px;
    box-sizing: border-box;
  }

  &__empty {
    margin: 24px 0 0;
    text-align: center;
    color: $color-secondary-text;
    font-size: $font-size-sm;
    font-weight: 700;
  }

  &__view-all {
    margin: 24px auto 0;
    border: none;
    background: transparent;
    color: $color-secondary;
    font-size: $font-size-sm;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: $space-sm;
  }

  &__export-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background-color: rgba(17, 24, 39, 0.42);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $space-lg;
    box-sizing: border-box;
  }

  &__export-modal {
    width: min(100%, 485px);
    background-color: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    box-shadow: $shadow-md;
    padding: 30px;
    box-sizing: border-box;
    text-align: center;

    h3 {
      margin: 18px 0 0;
      color: $color-main-text;
      font-size: 22px;
      font-weight: 800;
    }

    p {
      margin: $space-md 0 0;
      color: $color-secondary-text;
      font-size: 13px;
      font-weight: 600;
      line-height: 1.55;
    }
  }

  &__export-modal-icon {
    width: 56px;
    height: 56px;
    margin: 0 auto;
    border-radius: 50%;
    background-color: rgba($color-secondary, 0.12);
    color: $color-secondary;
    display: grid;
    place-items: center;
  }

  &__export-format-group {
    margin-top: $space-lg;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $space-md;
  }

  &__export-format {
    min-height: 74px;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    background-color: $color-primary;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    padding: $space-md;
    text-align: left;
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease;

    strong {
      color: $color-main-text;
      font-size: 14px;
      font-weight: 900;
    }

    span {
      color: $color-secondary-text;
      font-size: 12px;
      font-weight: 700;
    }

    &--active {
      border-color: $color-secondary;
      background-color: rgba($color-secondary, 0.06);

      strong {
        color: $color-secondary;
      }
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }
  }

  &__export-modal-summary {
    margin-top: $space-lg;
    min-height: 66px;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    background-color: $color-background;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 $space-lg;
    box-sizing: border-box;

    span {
      color: $color-secondary-text;
      font-size: 13px;
      font-weight: 800;
    }

    strong {
      color: $color-main-text;
      font-size: 30px;
      font-weight: 900;
    }
  }

  &__export-error {
    color: $color-danger !important;
    font-weight: 800 !important;
  }

  &__export-modal-actions {
    margin-top: $space-lg;
    display: flex;
    justify-content: flex-end;
    gap: $space-md;
  }

  &__export-cancel,
  &__export-confirm {
    min-width: 132px;
    height: $button-height;
    border-radius: $radius-md;
    font-size: $button-font-size;
    font-weight: 800;
    cursor: pointer;

    &:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
  }

  &__export-cancel {
    border: 1px solid $color-border;
    background-color: $color-primary;
    color: $color-secondary-text;
  }

  &__export-confirm {
    border: 1px solid $color-secondary;
    background-color: $color-secondary;
    color: $color-primary;
  }
}

@media (max-width: 1100px) {
  .support-dashboard {
    &__shell,
    &__shell--collapsed {
      grid-template-columns: 1fr;
      grid-template-rows: auto $accent-line-height auto 1fr;
    }

    &__shell--collapsed {
      .support-dashboard__brand {
        position: static;
        margin: 0;
        font-size: $font-size-md;
        font-weight: 700;
        color: $color-main-text;
        transform: none;
        z-index: auto;
      }
    }

    &__sidebar-header {
      grid-column: 1;
      grid-row: 1;
      min-height: $navbar-height;
      border-right: none;
      border-bottom: 1px solid $color-border;
      padding: 0 $space-lg;
      justify-content: flex-start;
      overflow: hidden;
    }

    &__brand {
      display: block;
    }

    &__sidebar-toggle {
      display: none;
    }

    &__topbar {
      grid-column: 1;
      grid-row: 3;
      height: auto;
      min-height: $navbar-height;
      justify-content: flex-start;
      padding: $space-lg;
    }

    &__top-actions {
      flex-wrap: wrap;
      gap: $space-lg;
    }

    &__accent-line {
      grid-row: 2;
    }

    &__sidebar {
      display: none;
    }

    &__content {
      grid-column: 1;
      grid-row: 4;
      padding: $space-lg;
    }

    &__header {
      flex-direction: column;
      align-items: flex-start;
      gap: $space-lg;
    }

    &__stats {
      grid-template-columns: 1fr;
      gap: $space-md;
    }
  }
}
</style>
