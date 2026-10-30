
import { describe, it, expect } from "vitest";
import { parseProductRows } from "../src/lib/parseProductRows";

describe("PDF Product Extraction", () => {

  it("extracts a valid product", () => {
    const text = "100234 | Paint Brush 50mm | 04 | 12";

    const result = parseProductRows(text, 1);

    expect(result).toEqual([{
      itemNumber: "100234",
      description: "Paint Brush 50mm",
      bay: "04",
      position: "12",
      sourcePage: 1,
    }]);
  });

  it("extracts multiple products", () => {
    const text = `
100234 | Paint Brush 50mm | 04 | 12
100235 | Paint Roller Set | 04 | 13
`;

    const result = parseProductRows(text, 1);

    expect(result).toHaveLength(2);
  });

  it("ignores invalid product rows", () => {
    const text = `
Item Number | Description | Bay | Position
123 | Invalid Product | 04 | 12
100234 | Paint Brush 50mm | 04 | 12
`;

    const result = parseProductRows(text, 1);

    expect(result).toHaveLength(1);
  });

  it("preserves the source PDF page", () => {
    const result = parseProductRows(
      "100234 | Paint Brush 50mm | 04 | 12",
      5
    );

    expect(result[0].sourcePage).toBe(5);
  });

  it("preserves leading zeros in locations", () => {
    const result = parseProductRows(
      "100234 | Paint Brush | 04 | 02",
      1
    );

    expect(result[0].bay).toBe("04");
    expect(result[0].position).toBe("02");
  });

  it("returns no products for empty text", () => {
    expect(parseProductRows("", 1)).toEqual([]);
  });

});
