import PersonalChatClient from "./PersonalChatClient";

// generateStaticParams must live in a Server Component (not "use client")
// Returns [] so Next.js knows this is a valid dynamic route for static export
export function generateStaticParams() {
    return [];
}

export default function Page() {
    return <PersonalChatClient />;
}
