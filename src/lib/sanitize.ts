const ALLOWED_TAGS = ['p', 'br', 'b', 'i', 'strong', 'em', 'ul', 'ol', 'li', 'span', 'h2', 'h3']
const ALLOWED_ATTRS: Record<string, string[]> = {
    a: ['href', 'target', 'rel'],
    span: ['style'],
}

export function sanitizeHtml(html: string): string {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
        .replace(/<object[\s\S]*?<\/object>/gi, '')
        .replace(/<embed[^>]*>/gi, '')
        .replace(/<link[^>]*>/gi, '')
        .replace(/<meta[^>]*>/gi, '')
}
