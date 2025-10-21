export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  isActive: boolean;
  parentId?: string;
  organizationId?: string;
}

export const mockProjects: Project[] = [
  {
    id: "1",
    name: "YFN 9.0",
    description:
      "Unser 9. Event, welches im Anschluss an die YFC stattfindet. Es wird finanziert aus dem Bertelsmann Geld, 100 Teilnehmende.",
    progress: 30,
    isActive: true,
  },
  {
    id: "2",
    name: "Sommercamp 2025",
    description:
      "Jährliches Sommercamp für Jugendliche mit Workshops, Sport und Gemeinschaft. Gefördert durch lokale Sponsoren.",
    progress: 65,
    isActive: true,
  },
  {
    id: "3",
    name: "Jugendtreff Renovierung",
    description:
      "Modernisierung der Räumlichkeiten des Jugendtreffs mit neuer Ausstattung und frischer Gestaltung.",
    progress: 45,
    isActive: true,
  },
  {
    id: "4",
    name: "Musikworkshop Serie",
    description:
      "Regelmäßige Musikworkshops für Anfänger und Fortgeschrittene mit professionellen Dozenten.",
    progress: 80,
    isActive: true,
  },
  {
    id: "5",
    name: "Weihnachtsfeier 2025",
    description:
      "Große Weihnachtsfeier mit Programm, Essen und Geschenken für alle Teilnehmer und Familien.",
    progress: 15,
    isActive: true,
  },
];

