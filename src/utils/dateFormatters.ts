function parseBackendDate(dateValue: string | null | undefined) {
  if (!dateValue) {
    return null;
  }

  const date = new Date(dateValue.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function formatNotificationTime(dateValue: string | null) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);
  const now = new Date();

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const differenceInMilliseconds = now.getTime() - date.getTime();
  const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
  const differenceInHours = Math.floor(differenceInMinutes / 60);
  const differenceInDays = Math.floor(differenceInHours / 24);

  if (differenceInMinutes < 1) {
    return "Just now";
  }

  if (differenceInMinutes < 60) {
    return `${differenceInMinutes}m ago`;
  }

  if (differenceInHours < 24) {
    return `${differenceInHours}h ago`;
  }

  if (differenceInDays === 1) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatTicketDate(dateValue: string | null | undefined) {
  const date = parseBackendDate(dateValue);

  if (!date) {
    return "N/A";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeTicketDate(dateValue: string | null | undefined) {
  const date = parseBackendDate(dateValue);
  const today = new Date();

  if (!date) {
    return "N/A";
  }

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const differenceInMilliseconds = todayOnly.getTime() - dateOnly.getTime();
  const differenceInDays = Math.round(differenceInMilliseconds / (1000 * 60 * 60 * 24));

  if (differenceInDays === 0) {
    return "Today";
  }

  if (differenceInDays === 1) {
    return "Yesterday";
  }

  return formatTicketDate(dateValue);
}

export function formatDashboardDate(dateValue: string | null | undefined) {
  const date = parseBackendDate(dateValue);
  const today = new Date();

  if (!date) {
    return "N/A";
  }

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const differenceInMilliseconds = todayOnly.getTime() - dateOnly.getTime();
  const differenceInDays = Math.round(differenceInMilliseconds / (1000 * 60 * 60 * 24));

  if (differenceInDays === 0) {
    return "Today";
  }

  if (differenceInDays === 1) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(dateValue: string | null | undefined) {
  const date = parseBackendDate(dateValue);

  if (!date) {
    return "N/A";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
