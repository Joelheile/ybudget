export type Transaction = {
  id: string;
  date: Date;
  name: string;
  description: string;
  project: string;
  category: string;
  amount: number;
  type: "expense" | "income";
  status: "geplant" | "bezahlt";
};

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: new Date(2025, 9, 13),
    name: "Amazon",
    description: "Sony Alpha VI, 18-150mm",
    project: "Crashkurs Steuern",
    category: "Equipment",
    amount: -30302.00,
    type: "expense",
    status: "geplant",
  },
  {
    id: "2",
    date: new Date(2025, 9, 13),
    name: "Bertelsmann Stiftung",
    description: "Zuwendung für das Jahr 2025",
    project: "YFN 8.0, YFN 9.0",
    category: "Equipment",
    amount: 15000.00,
    type: "income",
    status: "bezahlt",
  },
  {
    id: "3",
    date: new Date(2025, 9, 12),
    name: "QiTech GmbH",
    description: "RE0514",
    project: "Crashkurs Steuern",
    category: "Freelancer",
    amount: -217.83,
    type: "expense",
    status: "bezahlt",
  },
  {
    id: "4",
    date: new Date(2025, 9, 10),
    name: "DrinkForFood",
    description: "RF11",
    project: "YFN Schools",
    category: "Catering",
    amount: -240.00,
    type: "expense",
    status: "bezahlt",
  },
  {
    id: "5",
    date: new Date(2025, 9, 3),
    name: "META",
    description: "Ads",
    project: "YFC",
    category: "Werbemittel",
    amount: -32.34,
    type: "expense",
    status: "bezahlt",
  },
  {
    id: "6",
    date: new Date(2025, 9, 15),
    name: "Google Ads",
    description: "Marketing Campaign Q1",
    project: "YFN 9.0",
    category: "Werbemittel",
    amount: -450.00,
    type: "expense",
    status: "geplant",
  },
  {
    id: "7",
    date: new Date(2025, 9, 8),
    name: "Telekom",
    description: "Internet & Phone",
    project: "YFC",
    category: "Office",
    amount: -89.99,
    type: "expense",
    status: "bezahlt",
  },
  {
    id: "8",
    date: new Date(2025, 9, 20),
    name: "Freelancer Max",
    description: "Website Development",
    project: "YFN Schools",
    category: "Freelancer",
    amount: -1200.00,
    type: "expense",
    status: "geplant",
  },
  {
    id: "9",
    date: new Date(2025, 9, 5),
    name: "Stadt München",
    description: "Förderung Bildungsprojekt",
    project: "YFN 8.0",
    category: "Grants",
    amount: 25000.00,
    type: "income",
    status: "bezahlt",
  },
  {
    id: "10",
    date: new Date(2025, 9, 18),
    name: "Office Supplies GmbH",
    description: "Büromaterial Q1",
    project: "YFC",
    category: "Office",
    amount: -156.78,
    type: "expense",
    status: "geplant",
  },
];

