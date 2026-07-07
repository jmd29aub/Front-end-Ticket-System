export function compareBackendDateActivity(firstDateValue: string, secondDateValue: string) {
  const firstDate = new Date(firstDateValue.replace(" ", "T")).getTime();
  const secondDate = new Date(secondDateValue.replace(" ", "T")).getTime();

  const safeFirstDate = Number.isNaN(firstDate) ? 0 : firstDate;
  const safeSecondDate = Number.isNaN(secondDate) ? 0 : secondDate;

  return safeFirstDate - safeSecondDate;
}

export function isBackendDateActivityNewer(ticketDateValue: string, currentDateValue: string) {
  return compareBackendDateActivity(ticketDateValue, currentDateValue) > 0;
}
