export interface NtfyMessageBody {
    message?: string;
    title?: string;
    tags?: string[];
    priority?: 1 | 2 | 3 | 4 | 5;
    click?: `http://${string}.${string}` | `https://${string}.${string}`;
    attach?: `http://${string}.${string}` | `https://${string}.${string}`;
    markdown?: boolean;
    icon?: `http://${string}.${string}` | `https://${string}.${string}`;
    filename?: string;
    delay?: string;
    email?: `${string}@${string}.${string}`;
    call?: string | "yes";
    actions?: NtfyMessageAction[];
}

type NtfyMessageAction = {
    action: "view";
    label: string;
    url: string;
    clear?: boolean;
} | {
    action: "broadcast";
    label: string;
    intent?: string;
    extras?: Record<string, string>;
    clear?: boolean;
} | {
    action: "http";
    label: string;
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    clear?: boolean;
}