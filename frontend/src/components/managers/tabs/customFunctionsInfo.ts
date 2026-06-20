function safeValue(value: any): string {
  return value === null || value === undefined || value === ""
    ? "-"
    : String(value);
}

function pickValue(...values: any[]): string {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== "") {
      return String(value);
    }
  }
  return "-";
}

function normalizeBool(value: any): string {
  if (value === true || value === 1 || value === "1") return "Si";
  if (value === false || value === 0 || value === "0") return "No";
  return safeValue(value);
}

export { normalizeBool, pickValue, safeValue };
