/** File and id form of a race or class name: "Dark elf" → "dark-elf" (spec 009). */
export const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z]+/g, '-')
    .replace(/^-|-$/g, '');
