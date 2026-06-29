// Server Component — handles static export
export function generateStaticParams() {
    // Room IDs are unknown at build time; loaded client-side
    return [];
}

export { default } from "./PersonalChatClient";
