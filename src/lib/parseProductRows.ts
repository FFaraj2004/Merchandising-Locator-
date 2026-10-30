
export type ExtractedProduct = {
  itemNumber: string;
  description: string;
  bay: string;
  position: string;
  sourcePage: number;
};

export function parseProductRows(
  text: string,
  sourcePage: number
): ExtractedProduct[] {
  const lines = text.split(/\r?\n/);

  return lines.flatMap((line) => {
    const parts = line
      .split("|")
      .map((part) => part.trim());

    if (parts.length !== 4) {
      return [];
    }

    const [itemNumber, description, bay, position] =
      parts;

    if (
      !/^\d{4,12}$/.test(itemNumber) ||
      !description ||
      !/^\d{1,3}$/.test(bay) ||
      !/^\d{1,3}$/.test(position)
    ) {
      return [];
    }

    return [{
      itemNumber,
      description,
      bay,
      position,
      sourcePage,
    }];
  });
}
