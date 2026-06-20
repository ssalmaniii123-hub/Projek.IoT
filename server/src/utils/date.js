export function todayIsoDate() {
  const date = new Date();
  return localIsoDate(date);
}

export function lastSevenDates(anchor = new Date()) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(anchor);
    date.setDate(date.getDate() - (6 - index));
    return localIsoDate(date);
  });
}

function localIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
