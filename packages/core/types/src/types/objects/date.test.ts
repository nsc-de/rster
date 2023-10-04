import { DateTypeInformation, date } from "./date";

describe("DateTypeInformation", () => {
  it("check", () => {
    const typeInfo = new DateTypeInformation();
    expect(typeInfo.check(new Date())).toBe(true);
    expect(typeInfo.check("2020-01-01")).toBe(false);
  });

  it("sendableVia", () => {
    const typeInfo = new DateTypeInformation();
    expect(typeInfo.sendableVia()).toContain("body");
    expect(typeInfo.sendableVia()).not.toContain("query");
    expect(typeInfo.sendableVia()).not.toContain("param");
    expect(typeInfo.sendableVia("body")).toBe(true);
    expect(typeInfo.sendableVia("query")).toBe(false);
    expect(typeInfo.sendableVia("param")).toBe(false);
  });

  it("identifier", () => {
    const typeInfo = new DateTypeInformation();
    expect(typeInfo.identifier).toEqual("date");
  });

  it("exportToString", () => {
    const typeInfo = new DateTypeInformation();
    expect(typeInfo.exportToString(new Date("2020-01-01"))).toEqual(
      "2020-01-01T00:00:00.000Z"
    );
  });

  it("importFromString", () => {
    const typeInfo = new DateTypeInformation();
    expect(typeInfo.importFromString("2020-01-01T00:00:00.000Z")).toEqual(
      new Date("2020-01-01")
    );
  });

  it("toString", () => {
    const typeInfo = new DateTypeInformation();
    expect(typeInfo.toString()).toEqual("DateTypeInformation{}");
  });

  it("json", () => {
    const typeInfo = new DateTypeInformation();
    expect(typeInfo.json()).toEqual({ type: "date" });
  });
});

describe("date()", () => {
  it("test date type creation", () => {
    expect(date()).toBeInstanceOf(DateTypeInformation);
  });
});
