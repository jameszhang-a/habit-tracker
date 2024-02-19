import { convertWeekKeyToStartDate, getWeekKey } from ".";

// unit test file for every util function in the index.ts file
describe("Unit tests for util functions", () => {
  describe("convertWeekKeyToStartDate", () => {
    test.each([
      ["2023-51", new Date("2023-12-18")],
      ["2023-52", new Date("2023-12-25")],
      ["2024-7", new Date("2024-02-12")],
      ["2024-1", new Date("2024-01-01")],
      ["2025-1", new Date("2024-12-30")],
    ])("weekKey: '%s'", (a, date) => {
      expect(convertWeekKeyToStartDate(a)).toStrictEqual(date);
    });
  });

  test("just testing the week key 2023-52", () => {
    expect(convertWeekKeyToStartDate("2023-52")).toStrictEqual(
      new Date("2023-12-25")
    );
  });

  describe("getWeekKey", () => {
    test.each([
      // 2023
      ["2023-01-01", "2022-52"],
      ["2023-01-02", "2023-1"],
      ["2023-01-08", "2023-1"],
      ["2023-12-31", "2023-52"],
      ["2023-12-18", "2023-51"],
      // 2024
      ["2024-01-01", "2024-1"],
      ["2024-01-07", "2024-1"],
      ["2024-01-08", "2024-2"],
      ["2024-12-30", "2025-1"],
      // 2025
      ["2025-1-1", "2025-1"],
      ["2025-1-5", "2025-1"],
      ["2025-1-6", "2025-2"],
      ["2025-12-31", "2026-1"],
      // 2026
      ["2026-01-01", "2026-1"],
      ["2026-01-05", "2026-2"],
      // 2027
      ["2027-01-01", "2026-53"],
    ])("getWeekKey('%s') should return '%s'", (dateStr, weekKey) => {
      expect(getWeekKey(new Date(dateStr))).toStrictEqual(weekKey);
    });
  });
});
