import { AuthResponse, Contact, Message, Room, Schedule, Note, AccessCode, ApiError } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.brainboom-chat.workers.dev";

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("chat_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("chat_token");
    localStorage.removeItem("chat_role");
    localStorage.removeItem("chat_user");
    window.location.href = "/";
    throw new Error("Sesi berakhir, silakan login ulang");
  }

  if (response.status === 429) {
    throw new Error("Terlalu banyak permintaan, tunggu sebentar");
  }

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ error: "Terjadi kesalahan" }));
    throw new Error(error.error || "Terjadi kesalahan");
  }

  return response;
}

// Auth
export async function loginWithCode(code: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/api/auth/access`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Jawaban salah" }));
    throw new Error(error.error || "Jawaban salah");
  }

  return response.json();
}

// Rooms
export async function getRooms(): Promise<{ rooms: Room[] }> {
  const response = await fetchWithAuth("/api/rooms");
  return response.json();
}

// Contacts
export async function getContacts(): Promise<{ contacts: Contact[] }> {
  const response = await fetchWithAuth("/api/contacts");
  return response.json();
}

// Messages
export async function getMessages(
  roomId: number,
  cursor?: string,
  limit: number = 50
): Promise<{ messages: Message[]; nextCursor: string | null }> {
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  params.append("limit", limit.toString());

  const response = await fetchWithAuth(`/api/messages/${roomId}?${params}`);
  return response.json();
}

export async function sendMessage(
  roomId: number,
  content: string,
  type: "text" | "image" | "file" | "voice" = "text",
  fileUrl?: string,
  replyTo?: number
): Promise<Message> {
  const response = await fetchWithAuth("/api/messages", {
    method: "POST",
    body: JSON.stringify({ roomId, content, type, fileUrl, replyTo }),
  });
  return response.json();
}

export async function deleteMessage(messageId: number): Promise<void> {
  await fetchWithAuth(`/api/messages/${messageId}`, {
    method: "DELETE",
  });
}

// Schedules
export async function getSchedules(status?: string): Promise<{ schedules: Schedule[] }> {
  const params = status ? `?status=${status}` : "";
  const response = await fetchWithAuth(`/api/schedules${params}`);
  return response.json();
}

export async function createSchedule(data: Omit<Schedule, "id" | "createdBy" | "updatedAt" | "createdAt">): Promise<Schedule> {
  const response = await fetchWithAuth("/api/schedules", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateSchedule(id: number, data: Partial<Schedule>): Promise<Schedule> {
  const response = await fetchWithAuth(`/api/schedules/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteSchedule(id: number): Promise<void> {
  await fetchWithAuth(`/api/schedules/${id}`, {
    method: "DELETE",
  });
}

// Notes
export async function getNotes(): Promise<{ notes: Note[] }> {
  const response = await fetchWithAuth("/api/notes");
  return response.json();
}

export async function createNote(data: Omit<Note, "id" | "createdBy" | "updatedAt" | "createdAt">): Promise<Note> {
  const response = await fetchWithAuth("/api/notes", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateNote(id: number, data: Partial<Note>): Promise<Note> {
  const response = await fetchWithAuth(`/api/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteNote(id: number): Promise<void> {
  await fetchWithAuth(`/api/notes/${id}`, {
    method: "DELETE",
  });
}

// Settings
export async function getSettings(): Promise<{ user: any; accessCode?: AccessCode }> {
  const response = await fetchWithAuth("/api/settings");
  return response.json();
}

export async function resetAccessCode(): Promise<{ accessCode: AccessCode }> {
  const response = await fetchWithAuth("/api/settings/reset-code", {
    method: "PUT",
  });
  return response.json();
}

// Access Codes (Admin)
export async function getAccessCodes(): Promise<{ accessCodes: AccessCode[] }> {
  const response = await fetchWithAuth("/api/access-codes");
  return response.json();
}

export async function createAccessCode(data: { displayName: string; code?: string; role?: "admin" | "member" }): Promise<{ accessCode: AccessCode }> {
  const response = await fetchWithAuth("/api/access-codes", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function resetMemberCode(id: number): Promise<{ accessCode: AccessCode }> {
  const response = await fetchWithAuth(`/api/access-codes/${id}/reset`, {
    method: "PUT",
  });
  return response.json();
}

export async function deleteAccessCode(id: number): Promise<void> {
  await fetchWithAuth(`/api/access-codes/${id}`, {
    method: "DELETE",
  });
}

// Upload
export async function uploadFile(file: File): Promise<{ url: string; filename: string; size: number; mimeType: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("chat_token");
  const response = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Gagal upload file");
  }

  return response.json();
}
