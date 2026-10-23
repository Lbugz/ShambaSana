// Stored course names remain stable for existing enrollments and configuration.
export const courseDisplayName = (value: string) => value.replace(/(?<!Traditional )Chinese medicine/gi, "Traditional Chinese Medicine").replace("Foundations of Traditional Chinese Medicine", "Foundations of Chinese Medicine").replace("The Psyche in Traditional Chinese Medicine", "The Psyche in Chinese Medicine");
