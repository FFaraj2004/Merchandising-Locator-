
export type Product = {
  id: string;
  name: string;
  aisle: string;
  bay: string;
  shelf: string;
};

export const products: Product[] = [
  { id: "1001", name: "Cordless Drill", aisle: "12", bay: "3", shelf: "2" },
  { id: "1002", name: "Hex Bolts M12", aisle: "8", bay: "4", shelf: "1" },
  { id: "1003", name: "Hammer", aisle: "10", bay: "2", shelf: "3" },
  { id: "1004", name: "Screwdriver Set", aisle: "11", bay: "1", shelf: "2" },
  { id: "1005", name: "Timber Screws", aisle: "8", bay: "5", shelf: "4" },
  { id: "1006", name: "Impact Drill", aisle: "12", bay: "3", shelf: "1" },
];
