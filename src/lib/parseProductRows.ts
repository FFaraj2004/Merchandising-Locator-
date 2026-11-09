
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
  const lines = text.split(/\r\n|\n|\r/);

  return lines.flatMap((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return [];
    }

    let parts: string[] = [];

    // Format 1: Columns separated by |
    if (trimmedLine.includes("|")) {
      parts = trimmedLine.split("|");
    }

    // Format 2: Columns separated by tabs
    else if (trimmedLine.includes("\t")) {
      parts = trimmedLine.split("\t");
    }

    // Format 3: Columns separated by spaces
    else {
      const match = trimmedLine.match(
        /^(\d{4,12})\s+(.+?)\s+(\d{1,3})\s+(\d{1,3})$/
      );

      if (match) {
        parts = match.slice(1);
      }
    }

    parts = parts.map((part) => part.trim());

    if (parts.length !== 4) {
      return [];
    }

    const [itemNumber, description, bay, position] =
      parts;

    // Validate the extracted information
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
