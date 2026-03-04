// src/services/messageService.ts
export function generateRandomName(): string {
    const names = ["John", "Emily", "Sophia", "Michael", "Olivia", "James", "Ava"];
    const surnames = ["Smith", "Johnson", "Williams", "Brown", "Jones"];
    return `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`;
  }
  
  export function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  }
  
  export function formatTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
    return date.toLocaleTimeString(undefined, options);
  }
  
  export function truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  }
  