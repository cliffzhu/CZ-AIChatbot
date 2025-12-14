export interface TextMessage {
    type: 'text';
    content: string;
}
export interface ImageMessage {
    type: 'image';
    url: string;
    alt?: string;
    width?: number;
    height?: number;
    caption?: string;
}
export interface FormField {
    name: string;
    type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox';
    label: string;
    required?: boolean;
    options?: string[];
}
export interface FormMessage {
    type: 'form';
    id: string;
    fields: FormField[];
    submitLabel?: string;
    validation?: any;
}
export interface ButtonOption {
    text: string;
    value: string;
}
export interface ButtonsMessage {
    type: 'buttons';
    id: string;
    options: ButtonOption[];
}
export interface ActionMessage {
    type: 'action';
    name: string;
    payload?: any;
}
export interface ErrorMessage {
    type: 'error';
    code: string;
    message: string;
}
export type Message = TextMessage | ImageMessage | FormMessage | ButtonsMessage | ActionMessage | ErrorMessage;
export interface InteractionMessage {
    type: 'interaction';
    interactionId: string;
    values?: Record<string, any>;
    selection?: string;
}
export interface StreamingEvent {
    type: 'delta' | 'message' | 'done' | 'error';
    content?: string;
    message?: Message;
    error?: string;
}
export interface QueryPayload {
    conversationId?: string;
    message?: string | InteractionMessage;
    metadata?: any;
}
export interface TokenResponse {
    token: string;
    expiresAt: number;
}
//# sourceMappingURL=index.d.ts.map