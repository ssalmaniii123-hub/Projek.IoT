const events = [];
const maxEvents = 80;

export function addDiagnosticEvent(event) {
  const entry = {
    id: Date.now() + Math.random(),
    timestamp: new Date().toISOString(),
    ...event
  };

  events.unshift(entry);
  if (events.length > maxEvents) events.pop();
  return entry;
}

export function listDiagnosticEvents() {
  return events;
}
