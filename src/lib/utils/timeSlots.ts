import { isAfter, isBefore, isEqual } from "date-fns";

export function getSlots(
  start: Date,
  end: Date,
  intervalInMinutes = 30
): { start: Date; end: Date }[] {
  if (isAfter(start, end)) {
    throw new Error("start must be before end");
  }
  const slots = [];
  let current = start;

  while (
    isAfter(end, new Date(current.getTime() + (intervalInMinutes - 1) * 60000))
  ) {
    slots.push({
      start: current,
      end: new Date(current.getTime() + (intervalInMinutes - 1) * 60000),
    });
    current = new Date(current.getTime() + intervalInMinutes * 60000);
  }
  return slots;
}

export function getSlotIndex(
  slots: { start: Date; end: Date }[],
  selectedTime: Date
): number {
  return slots.findIndex(
    (slot) =>
      isEqual(slot.start, selectedTime) ||
      (isAfter(selectedTime, slot.start) && isBefore(selectedTime, slot.end)) ||
      isEqual(slot.end, selectedTime)
  );
}
