import { expect, it } from "vitest";
import { dueThoughts, localDate, validRevisitDate } from "./thoughts";
it("validates real calendar dates and uses local calendar days", () => {
  expect(validRevisitDate("2026-02-29")).toBe(false);
  expect(validRevisitDate("2028-02-29")).toBe(true);
  expect(localDate(new Date(2026, 9, 3, 23, 59))).toBe("2026-10-03");
});
it("reminds about overdue saved thoughts unless acknowledged for that exact date", () => {
  const values = [
    { id: "due", status: "saved", revisitDate: "2026-10-03" },
    { id: "late", status: "saved", revisitDate: "2026-10-01" },
    { id: "future", status: "saved", revisitDate: "2026-10-04" },
    { id: "ack", status: "saved", revisitDate: "2026-10-03", reminderAcknowledgedDate: "2026-10-03" },
    { id: "active", status: "active", revisitDate: "2026-10-03" }
  ];
  expect(dueThoughts(values, "2026-10-03").map(({ id }) => id)).toEqual(["due", "late"]);
});
