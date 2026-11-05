// Every piece of text a person typed goes through esc() before it reaches innerHTML.
const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const esc = (text: string) => text.replace(/[&<>"']/g, (c) => ENTITIES[c]);

export const num = (n: number) => Math.floor(n).toLocaleString('en');
