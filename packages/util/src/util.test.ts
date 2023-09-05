import { ArrayFinder } from "./util";

describe("ArrayFinder", () => {
  it("should find an element in an array", () => {
    const array: [
      {
        name: "test";
        value: 1;
      },
      {
        name: "test2";
        value: 2;
      }
    ] = [
      {
        name: "test",
        value: 1,
      },
      {
        name: "test2",
        value: 2,
      },
    ];

    const result = ArrayFinder(array, "name");

    expect(result.test).toEqual({
      name: "test",
      value: 1,
    });

    expect(result.test2).toEqual({
      name: "test2",
      value: 2,
    });
  });
});
