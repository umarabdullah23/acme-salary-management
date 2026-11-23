export interface NamePool {
  first: readonly string[];
  last: readonly string[];
}

export const NAMES: Readonly<Record<string, NamePool>> = {
  US: {
    first: ["James", "Emily", "Michael", "Olivia", "Daniel", "Sophia", "Matthew", "Ava", "Andrew", "Isabella", "Joshua", "Mia", "Ryan", "Charlotte", "Tyler", "Amelia", "Brandon", "Harper", "Nathan", "Grace"],
    last: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson", "Anderson", "Taylor", "Thomas", "Moore", "Martin", "Jackson", "Thompson", "White", "Harris", "Clark", "Lewis", "Walker"],
  },
  IN: {
    first: ["Aarav", "Priya", "Rohan", "Ananya", "Vikram", "Neha", "Arjun", "Kavya", "Siddharth", "Meera", "Rahul", "Divya", "Karan", "Pooja", "Amit", "Sneha", "Nikhil", "Ishita", "Varun", "Aditi"],
    last: ["Sharma", "Patel", "Singh", "Gupta", "Reddy", "Iyer", "Nair", "Mehta", "Joshi", "Kulkarni", "Desai", "Banerjee", "Chopra", "Rao", "Verma", "Malhotra", "Bose", "Menon", "Agarwal", "Kapoor"],
  },
  GB: {
    first: ["Oliver", "Amelia", "George", "Isla", "Harry", "Poppy", "Jack", "Freya", "Charlie", "Lily", "Thomas", "Ella", "Oscar", "Evie", "William", "Florence", "Henry", "Grace", "Alfie", "Ruby"],
    last: ["Evans", "Taylor", "Roberts", "Hughes", "Edwards", "Walker", "Wright", "Green", "Hall", "Wood", "Harrison", "Patel", "Clarke", "Jackson", "Turner", "Hill", "Cooper", "Ward", "Morris", "Baker"],
  },
  DE: {
    first: ["Lukas", "Hannah", "Felix", "Lena", "Jonas", "Mia", "Leon", "Emma", "Maximilian", "Sophie", "Paul", "Clara", "Tim", "Laura", "Niklas", "Anna", "Jan", "Marie", "Moritz", "Julia"],
    last: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Koch", "Richter", "Klein", "Wolf", "Neumann", "Schwarz", "Zimmermann", "Braun", "Krüger", "Hartmann"],
  },
  PK: {
    first: ["Ahmed", "Fatima", "Ali", "Ayesha", "Hassan", "Zainab", "Usman", "Maryam", "Bilal", "Hira", "Hamza", "Sana", "Saad", "Noor", "Imran", "Khadija", "Faisal", "Amna", "Omar", "Rabia"],
    last: ["Khan", "Ahmed", "Malik", "Hussain", "Sheikh", "Butt", "Raza", "Siddiqui", "Qureshi", "Chaudhry", "Mirza", "Abbasi", "Farooq", "Javed", "Iqbal", "Ansari", "Mansoori", "Rehman", "Yousaf", "Nawaz"],
  },
  BR: {
    first: ["Gabriel", "Beatriz", "Lucas", "Mariana", "Pedro", "Juliana", "Rafael", "Camila", "Mateus", "Larissa", "Bruno", "Fernanda", "Thiago", "Isabela", "Felipe", "Amanda", "Gustavo", "Carolina", "Diego", "Leticia"],
    last: ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Barbosa", "Rocha", "Dias", "Nascimento"],
  },
  CA: {
    first: ["Liam", "Emma", "Noah", "Chloe", "Ethan", "Zoe", "Logan", "Ella", "Mason", "Hailey", "Lucas", "Nora", "Owen", "Maya", "Jacob", "Avery", "Aiden", "Lucy", "Connor", "Piper"],
    last: ["Tremblay", "Roy", "Gagnon", "Campbell", "MacDonald", "Wilson", "Stewart", "Murphy", "Bouchard", "Fraser", "Singh", "Lee", "Chan", "Cote", "Morin", "Gauthier", "Fortin", "Ross", "Kelly", "Wong"],
  },
  AU: {
    first: ["Jack", "Charlotte", "William", "Matilda", "Cooper", "Ruby", "Lachlan", "Chloe", "Mitchell", "Georgia", "Hunter", "Sienna", "Riley", "Indiana", "Angus", "Harper", "Callum", "Willow", "Flynn", "Zara"],
    last: ["Smith", "Jones", "Williams", "Brown", "Wilson", "Taylor", "Johnson", "White", "Martin", "Anderson", "Thompson", "Nguyen", "Thomas", "Walker", "Harris", "Lee", "Ryan", "Robinson", "Kelly", "King"],
  },
};
