'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/axios";
import { useAuth } from "@/lib/useAuth";
import { messagesApi, Message, Conversation } from "@/lib/messages";

type HrUser = {
  id: number;
  name: string;
  email?: string;
  profile_image?: string | null;
};

type ConversationMeta = {
  archived?: boolean;
  muted?: boolean;
  blocked?: boolean;
};

type HrConversationItem =
  | {
      kind: "dm";
      key: string; // `dm:<userId>`
      user: HrUser;
      latest_message: Message;
      unread_count: number;
      updated_at: string;
    }
  | {
      kind: "group";
      key: string; // `group:<timestamp>`
      title: string;
      memberIds: number[];
      members: HrUser[];
      latestPreview: string;
      unread_count: number;
      updated_at: string;
      messages: Message[];
    };

type Screen = "chat" | "new-group" | "report";

const META_STORAGE_KEY = "avaa_hr_messages_meta_v1";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function safeNowIso() {
  return new Date().toISOString();
}

export default function HrMessages({
  initialUserId,
  onBack,
}: {
  initialUserId?: string | null;
  onBack?: () => void;
}) {
  const { user } = useAuth({ redirect: false });
  const [loading, setLoading] = useState(true);

  const [screen, setScreen] = useState<Screen>("chat");
  const [sidebarTab, setSidebarTab] = useState<"all" | "archived">("all");
  const [search, setSearch] = useState("");

  const [metaMap, setMetaMap] = useState<Record<string, ConversationMeta>>({});

  const [dmConversations, setDmConversations] = useState<Conversation[]>([]);
  const [groupConversations, setGroupConversations] = useState<
    HrConversationItem[]
  >([]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [dmMessages, setDmMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(
    null,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement | null>(null);

  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [toast, setToast] = useState<string>("");

  // New group view
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerUsers, setPickerUsers] = useState<HrUser[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<HrUser[]>([]);

  // Report view
  const [reportReason, setReportReason] = useState<
    | "inappropriate"
    | "spam"
    | "scam"
    | "impersonation_company"
    | "impersonation_profile"
    | ""
  >("inappropriate");
  const [reportDetails, setReportDetails] = useState("");

  const selectedDmConversation = useMemo(() => {
    if (!selectedKey?.startsWith("dm:")) return null;
    const id = Number(selectedKey.replace("dm:", ""));
    return dmConversations.find((c) => c.user.id === id) ?? null;
  }, [dmConversations, selectedKey]);

  const selectedGroupConversation = useMemo(() => {
    if (!selectedKey?.startsWith("group:")) return null;
    return (
      groupConversations.find((c) => c.kind === "group" && c.key === selectedKey) ??
      null
    );
  }, [groupConversations, selectedKey]);

  const selectedUser = selectedDmConversation?.user ?? null;

  const selectedMeta = useMemo(() => {
    if (!selectedKey) return {};
    return metaMap[selectedKey] ?? {};
  }, [metaMap, selectedKey]);

  const isBlocked = Boolean(selectedMeta.blocked);

  const formatTime = (dateString: string) =>
    formatDistanceToNow(new Date(dateString), { addSuffix: true });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [dmMessages, selectedKey, groupConversations]);

  useEffect(() => {
    const raw = localStorage.getItem(META_STORAGE_KEY);
    if (raw) {
      try {
        setMetaMap(JSON.parse(raw));
      } catch {
        setMetaMap({});
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(META_STORAGE_KEY, JSON.stringify(metaMap));
  }, [metaMap]);

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  // Load DM conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle initialUserId to auto select
  useEffect(() => {
    if (!initialUserId) return;
    if (dmConversations.length > 0) {
      const target = dmConversations.find(
        (c) => c.user.id === parseInt(initialUserId),
      );
      if (target) {
        setSelectedKey(`dm:${target.user.id}`);
        setPendingUserId(null);
      }
    } else {
      setPendingUserId(initialUserId);
    }
  }, [initialUserId, dmConversations]);

  useEffect(() => {
    if (!pendingUserId || dmConversations.length === 0) return;
    const target = dmConversations.find(
      (c) => c.user.id === parseInt(pendingUserId),
    );
    if (target) {
      setSelectedKey(`dm:${target.user.id}`);
      setPendingUserId(null);
    }
  }, [pendingUserId, dmConversations]);

  // Fetch DM messages for selected conversation
  useEffect(() => {
    if (!selectedKey?.startsWith("dm:")) return;
    const userId = Number(selectedKey.replace("dm:", ""));
    if (!Number.isFinite(userId)) return;
    fetchMessages(userId);
  }, [selectedKey]);

  // Toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messagesApi.getConversations();
      const list = (response as any)?.data ?? [];
      setDmConversations(list);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: number) => {
    try {
      const response = await messagesApi.getConversation(userId);
      const list = (response as any)?.data ?? [];
      setDmMessages(list);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      setDmMessages([]);
    }
  };

  const sendDmMessage = async () => {
    if (!selectedDmConversation) return;
    if (isBlocked) return;
    if (!newMessage.trim() && !fileInputRef?.files?.[0]) return;

    try {
      setSendingMessage(true);
      const messageData: any = { content: newMessage.trim() };
      if (fileInputRef?.files?.[0]) messageData.file = fileInputRef.files[0];

      const response = await messagesApi.sendMessage(
        selectedDmConversation.user.id,
        messageData,
      );
      const msg = (response as any)?.data;
      if (msg) setDmMessages((prev) => [...prev, msg]);
      setNewMessage("");
      if (fileInputRef) fileInputRef.value = "";
      fetchConversations();
    } catch (error) {
      console.error("Failed to send message:", error);
      setToast("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const sendGroupMessage = () => {
    if (!selectedGroupConversation || selectedGroupConversation.kind !== "group")
      return;
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: Date.now(),
      sender_id: user?.id ?? -1,
      receiver_id: -1,
      content: newMessage.trim(),
      type: "text",
      created_at: safeNowIso(),
      updated_at: safeNowIso(),
      sender: { id: user?.id ?? -1, name: user?.name ?? "HR" },
      receiver: { id: -1, name: "Group" },
    };
    setGroupConversations((prev) =>
      prev.map((c) => {
        if (c.kind !== "group" || c.key !== selectedGroupConversation.key)
          return c;
        const nextMessages = [...c.messages, msg];
        return {
          ...c,
          messages: nextMessages,
          latestPreview: msg.content,
          updated_at: msg.created_at,
        };
      }),
    );
    setNewMessage("");
  };

  const handleComposerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (selectedKey?.startsWith("group:")) sendGroupMessage();
      else sendDmMessage();
    }
  };

  const updateMeta = (key: string, patch: ConversationMeta) => {
    setMetaMap((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), ...patch } }));
  };

  const handleActionMute = () => {
    if (!selectedKey) return;
    updateMeta(selectedKey, { muted: !Boolean(metaMap[selectedKey]?.muted) });
    setShowActions(false);
    setToast(Boolean(metaMap[selectedKey]?.muted) ? "Unmuted" : "Muted");
  };

  const handleActionArchive = () => {
    if (!selectedKey) return;
    updateMeta(selectedKey, {
      archived: !Boolean(metaMap[selectedKey]?.archived),
    });
    setShowActions(false);
    setToast(Boolean(metaMap[selectedKey]?.archived) ? "Unarchived" : "Archived");
  };

  const handleActionReport = () => {
    setShowActions(false);
    setScreen("report");
  };

  const handleActionBlock = () => {
    setShowActions(false);
    setShowBlockConfirm(true);
  };

  const handleActionDeleteConversation = async () => {
    if (!selectedKey) return;
    setShowActions(false);
    if (!selectedKey.startsWith("dm:")) {
      // local-only delete for group
      setGroupConversations((prev) =>
        prev.filter((c) => c.kind !== "group" || c.key !== selectedKey),
      );
      setSelectedKey(null);
      setToast("Conversation deleted");
      return;
    }

    const userId = Number(selectedKey.replace("dm:", ""));
    try {
      await messagesApi.deleteConversation(userId);
      setSelectedKey(null);
      setDmMessages([]);
      fetchConversations();
      setToast("Conversation deleted");
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      setToast("Failed to delete conversation");
    }
  };

  const openNewGroup = async () => {
    setScreen("new-group");
    setSelectedRecipients([]);
    setPickerQuery("");
    try {
      const res = await api.get("/hr/conversable-users");
      const users = res.data?.data ?? res.data ?? [];
      const list: HrUser[] = Array.isArray(users)
        ? users.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            profile_image: u.profile_image ?? null,
          }))
        : [];
      setPickerUsers(list);
    } catch (e) {
      console.error("Failed to load users for group picker", e);
      setPickerUsers([]);
    }
  };

  const createGroup = () => {
    if (selectedRecipients.length < 2) {
      setToast("Select at least 2 people");
      return;
    }
    const key = `group:${Date.now()}`;
    const title =
      selectedRecipients.length === 2
        ? `${selectedRecipients[0].name} + ${selectedRecipients[1].name}`
        : `${selectedRecipients[0].name}, ${selectedRecipients[1].name} +${
            selectedRecipients.length - 2
          }`;

    const group: HrConversationItem = {
      kind: "group",
      key,
      title,
      memberIds: selectedRecipients.map((r) => r.id),
      members: selectedRecipients,
      latestPreview: "Group created",
      unread_count: 0,
      updated_at: safeNowIso(),
      messages: [],
    };
    setGroupConversations((prev) => [group, ...prev]);
    setSelectedKey(key);
    setScreen("chat");
    setToast("Group created");
  };

  const submitReport = () => {
    setToast("Report submitted");
    setReportDetails("");
    setScreen("chat");
  };

  const confirmBlock = () => {
    if (!selectedKey) return;
    updateMeta(selectedKey, { blocked: true });
    setShowBlockConfirm(false);
    setToast("Blocked");
  };

  const allItems: HrConversationItem[] = useMemo(() => {
    const dm: HrConversationItem[] = dmConversations.map((c) => ({
      kind: "dm",
      key: `dm:${c.user.id}`,
      user: c.user,
      latest_message: c.latest_message,
      unread_count: c.unread_count,
      updated_at: c.updated_at,
    }));
    return [...groupConversations, ...dm].sort(
      (a, b) => +new Date(b.updated_at) - +new Date(a.updated_at),
    );
  }, [dmConversations, groupConversations]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allItems
      .filter((item) => {
        const meta = metaMap[item.key] ?? {};
        const isArchived = Boolean(meta.archived);
        if (sidebarTab === "archived" && !isArchived) return false;
        if (sidebarTab === "all" && isArchived) return false;
        if (!q) return true;
        if (item.kind === "group") return item.title.toLowerCase().includes(q);
        return item.user.name.toLowerCase().includes(q);
      })
      .slice(0, 200);
  }, [allItems, metaMap, search, sidebarTab]);

  const pickerFiltered = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    if (!q) return pickerUsers.slice(0, 20);
    return pickerUsers
      .filter((u) => u.name.toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q))
      .slice(0, 20);
  }, [pickerQuery, pickerUsers]);

  const mainHeaderTitle = useMemo(() => {
    if (selectedGroupConversation?.kind === "group") return selectedGroupConversation.title;
    if (selectedUser) return selectedUser.name;
    return "Messages";
  }, [selectedGroupConversation, selectedUser]);

  const mainHeaderSubtitle = useMemo(() => {
    if (selectedGroupConversation?.kind === "group") return `${selectedGroupConversation.members.length} members`;
    if (selectedUser) return "Online";
    return "";
  }, [selectedGroupConversation, selectedUser]);

  const mainMessages = useMemo(() => {
    if (selectedGroupConversation?.kind === "group") return selectedGroupConversation.messages;
    return dmMessages;
  }, [dmMessages, selectedGroupConversation]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] overflow-hidden flex h-[calc(100vh-200px)]">
      {/* Sidebar */}
      <aside className="w-[320px] border-r border-[#e5e7eb] flex flex-col">
        <div className="px-5 py-4 border-b border-[#eef2f5]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] flex items-center justify-center text-[#5a6a75]"
                aria-label="Back"
                onClick={() => {
                  if (onBack) {
                    onBack();
                  } else {
                    setSelectedKey(null);
                    setScreen("chat");
                  }
                }}
              >
                <span className="text-[18px]">←</span>
              </button>
              <h1 className="text-[18px] font-extrabold text-[#1a1a1a]">
                Messages
              </h1>
            </div>

            <button
              type="button"
              onClick={openNewGroup}
              className="w-9 h-9 rounded-lg border border-[#e5e7eb] bg-white hover:bg-[#f9fafb] flex items-center justify-center text-[#5a6a75]"
              aria-label="New message / group"
              title="New message"
            >
              ✎
            </button>
          </div>

          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search..."
              className="w-full rounded-xl border border-[#e5e7eb] bg-white py-2 pl-9 pr-3 text-sm text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 text-[#9ca3af]"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarTab("all")}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-bold border ${
                sidebarTab === "all"
                  ? "bg-[#7EB0AB] text-white border-[#7EB0AB]"
                  : "bg-white text-[#5a6a75] border-[#e5e7eb] hover:bg-[#f9fafb]"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab("archived")}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-bold border ${
                sidebarTab === "archived"
                  ? "bg-[#7EB0AB] text-white border-[#7EB0AB]"
                  : "bg-white text-[#5a6a75] border-[#e5e7eb] hover:bg-[#f9fafb]"
              }`}
            >
              Archived
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-[#6b7280]">Loading…</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-4 text-center text-[#6b7280]">
              No conversations
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedKey === item.key;
              const meta = metaMap[item.key] ?? {};
              const title = item.kind === "group" ? item.title : item.user.name;
              const preview =
                item.kind === "group"
                  ? item.latestPreview
                  : item.latest_message?.type === "file"
                    ? `📎 ${item.latest_message.content}`
                    : item.latest_message?.content ?? "";
              const timeLabel = formatTime(item.updated_at);

              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setSelectedKey(item.key);
                    setScreen("chat");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-[#f0f2f5] transition-colors ${
                    isSelected ? "bg-[#e6f7f2]" : "hover:bg-[#f9fafb]"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-[#1e3a4f] text-white flex items-center justify-center text-sm font-extrabold">
                      {getInitials(title || "U")}
                    </div>
                    {item.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                        {item.unread_count}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-[13px] font-extrabold text-[#111827] truncate">
                        {title}
                      </p>
                      <span className="text-[11px] text-[#9ca3af] whitespace-nowrap">
                        {timeLabel}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#6b7280] truncate">
                      {meta.muted ? "🔇 " : ""}
                      {meta.archived ? "📁 " : ""}
                      {preview}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Main */}
      <section className="flex-1 flex flex-col bg-white">
        {/* Top bar (matches screenshot “Messages” pill placement vibe) */}
        <div className="h-14 border-b border-[#eef2f5] flex items-center justify-center relative">
          <div className="px-4 py-2 rounded-lg bg-[#7EB0AB] text-white text-[12px] font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white/70" />
            Messages
          </div>
        </div>

        {/* Screens */}
        {screen === "new-group" ? (
          <div className="flex-1 overflow-y-auto">
            <div className="px-8 py-6">
              <div className="flex items-center gap-4">
                <p className="text-[12px] font-bold text-[#1a1a1a] shrink-0">
                  New message
                </p>
                <div className="flex-1">
                  <input
                    value={pickerQuery}
                    onChange={(e) => setPickerQuery(e.target.value)}
                    placeholder="Type a name or multiple names"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e5e7eb] text-sm outline-none focus:ring-2 focus:ring-[#7EB0AB]/40"
                  />
                </div>
                <button
                  type="button"
                  onClick={createGroup}
                  className="px-5 py-2.5 rounded-xl bg-[#7EB0AB] text-white text-[12px] font-bold hover:opacity-90"
                >
                  Create Group
                </button>
              </div>

              {/* Chips */}
              {selectedRecipients.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedRecipients.map((r) => (
                    <span
                      key={r.id}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#e5e7eb] bg-white text-[12px] font-semibold text-[#1a1a1a]"
                    >
                      <span className="w-8 h-8 rounded-xl bg-[#f0f2f5] flex items-center justify-center text-[11px] font-bold text-[#1e3a4f]">
                        {getInitials(r.name)}
                      </span>
                      <span className="leading-tight">
                        <span className="block">{r.name}</span>
                        <span className="block text-[10px] text-[#9ca3af] font-medium">
                          {r.email ?? ""}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedRecipients((prev) =>
                            prev.filter((x) => x.id !== r.id),
                          )
                        }
                        className="ml-2 w-7 h-7 rounded-full hover:bg-[#f0f2f5] text-[#9ca3af] flex items-center justify-center"
                        aria-label="Remove"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Results */}
              <div className="mt-5 border border-[#eef2f5] rounded-2xl overflow-hidden">
                {pickerFiltered.length === 0 ? (
                  <div className="p-4 text-center text-[#6b7280] text-sm">
                    No results
                  </div>
                ) : (
                  pickerFiltered.map((u) => {
                    const isPicked = selectedRecipients.some((x) => x.id === u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          if (isPicked) {
                            setSelectedRecipients((prev) =>
                              prev.filter((x) => x.id !== u.id),
                            );
                          } else {
                            setSelectedRecipients((prev) => [...prev, u]);
                          }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#eef2f5] hover:bg-[#f9fafb]"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#1e3a4f] text-white flex items-center justify-center text-[12px] font-extrabold">
                          {getInitials(u.name)}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-[13px] font-extrabold text-[#111827] truncate">
                            {u.name}
                          </p>
                          <p className="text-[12px] text-[#9ca3af] truncate">
                            {u.email ?? ""}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isPicked
                              ? "bg-[#7EB0AB] border-[#7EB0AB]"
                              : "border-[#d1d5db]"
                          }`}
                        >
                          {isPicked && (
                            <span className="text-white text-[12px] font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setScreen("chat")}
                  className="px-5 py-2.5 rounded-xl border border-[#e5e7eb] text-[#1a1a1a] text-[12px] font-bold hover:bg-[#f9fafb]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : screen === "report" ? (
          <div className="flex-1 overflow-y-auto">
            <div className="px-8 py-7 max-w-4xl">
              <button
                type="button"
                onClick={() => setScreen("chat")}
                className="text-[12px] font-bold text-[#7EB0AB] hover:underline"
              >
                ← Back to Messages
              </button>

              <h2 className="mt-4 text-[18px] font-extrabold text-[#1a1a1a]">
                Report Safety Concern
              </h2>
              <p className="mt-1 text-[12px] text-[#9ca3af]">
                Your safety is our priority. Reports are handled confidentially by our trust and safety team.
              </p>

              <div className="mt-6 border border-[#e5e7eb] rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f0f2f5] flex items-center justify-center font-bold text-[#1e3a4f]">
                  {getInitials(mainHeaderTitle)}
                </div>
                <div>
                  <p className="text-[11px] text-[#9ca3af] font-bold">
                    Reporting:
                  </p>
                  <p className="text-[13px] font-extrabold text-[#1a1a1a]">
                    {mainHeaderTitle}
                  </p>
                </div>
              </div>

              <p className="mt-6 text-[12px] font-extrabold text-[#1a1a1a]">
                What’s the main reason for your report?
              </p>

              <div className="mt-3 space-y-3">
                {[
                  {
                    id: "inappropriate",
                    title: "Inappropriate behavior",
                    desc:
                      "Unprofessional language, harassment, or offensive communication style.",
                  },
                  {
                    id: "spam",
                    title: "Spam or automated content",
                    desc:
                      "Unsolicited marketing, bots, or excessive repetitive messages.",
                  },
                  {
                    id: "scam",
                    title: "Suspicious job offer or scam",
                    desc:
                      "Asking for bank details, external payments, or “get rich quick” schemes.",
                  },
                  {
                    id: "impersonation_company",
                    title: "Identity theft or faking profile",
                    desc:
                      "Using a fake name, photo, or pretending to represent a company they don’t.",
                  },
                  {
                    id: "impersonation_profile",
                    title: "Identity theft or faking profile",
                    desc: "None of the above matches my specific concern.",
                  },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setReportReason(r.id as any)}
                    className={`w-full text-left p-4 rounded-2xl border transition-colors ${
                      reportReason === (r.id as any)
                        ? "border-[#7EB0AB] bg-[#f8fffe]"
                        : "border-[#e5e7eb] hover:bg-[#f9fafb]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center ${
                          reportReason === (r.id as any)
                            ? "border-[#7EB0AB]"
                            : "border-[#d1d5db]"
                        }`}
                      >
                        {reportReason === (r.id as any) && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#7EB0AB]" />
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-extrabold text-[#1a1a1a]">
                          {r.title}
                        </p>
                        <p className="text-[12px] text-[#9ca3af] mt-0.5">
                          {r.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <p className="text-[12px] font-extrabold text-[#1a1a1a]">
                  Additional details (Optional)
                </p>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={4}
                  placeholder="Please provide more context or specific examples to help us investigate…"
                  className="mt-2 w-full rounded-2xl border border-[#e5e7eb] bg-white p-4 text-[13px] outline-none focus:ring-2 focus:ring-[#7EB0AB]/40 resize-none"
                />
                <p className="mt-2 text-[11px] text-[#9ca3af]">
                  Maximum 1000 characters.
                </p>
              </div>

              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setScreen("chat")}
                  className="px-6 py-2.5 rounded-xl border border-[#e5e7eb] text-[12px] font-bold text-[#1a1a1a] hover:bg-[#f9fafb]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReport}
                  className="px-7 py-2.5 rounded-xl bg-[#7EB0AB] text-white text-[12px] font-bold hover:opacity-90"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Conversation header */}
            <div className="px-7 py-4 border-b border-[#eef2f5] flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#1e3a4f] text-white flex items-center justify-center text-[12px] font-extrabold shrink-0">
                  {getInitials(mainHeaderTitle)}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-extrabold text-[#111827] truncate">
                    {mainHeaderTitle}
                  </p>
                  {mainHeaderSubtitle && (
                    <p className="text-[12px] text-[#22c55e] font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                      {mainHeaderSubtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="relative" ref={actionsRef}>
                <button
                  type="button"
                  onClick={() => setShowActions((v) => !v)}
                  className="w-9 h-9 rounded-xl hover:bg-[#f0f2f5] flex items-center justify-center text-[#5a6a75]"
                  aria-label="Actions"
                >
                  ⋮
                </button>

                {showActions && selectedKey && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e5e7eb] rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] overflow-hidden z-20">
                    <button
                      type="button"
                      onClick={handleActionMute}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-[#1a1a1a] hover:bg-[#f9fafb]"
                    >
                      <span className="text-[#9ca3af]">🔕</span> Mute Notification
                    </button>
                    <button
                      type="button"
                      onClick={handleActionArchive}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-[#1a1a1a] hover:bg-[#f9fafb]"
                    >
                      <span className="text-[#9ca3af]">🗂</span> Archive Conversation
                    </button>
                    <button
                      type="button"
                      onClick={handleActionBlock}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-[#1a1a1a] hover:bg-[#f9fafb]"
                    >
                      <span className="text-[#9ca3af]">⛔</span> Block
                    </button>
                    <button
                      type="button"
                      onClick={handleActionReport}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-[#1a1a1a] hover:bg-[#f9fafb]"
                    >
                      <span className="text-[#9ca3af]">🚩</span> Report
                    </button>
                    <div className="h-px bg-[#f0f2f5]" />
                    <button
                      type="button"
                      onClick={handleActionDeleteConversation}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-red-500 hover:bg-red-50"
                    >
                      <span className="text-red-400">🗑</span> Delete Conversation
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 bg-white">
              {!selectedKey ? (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <div className="w-14 h-14 bg-[#f0f2f5] rounded-full flex items-center justify-center mx-auto mb-4 text-[#9ca3af]">
                      💬
                    </div>
                    <p className="text-[14px] font-extrabold text-[#1a1a1a]">
                      Select a conversation
                    </p>
                    <p className="text-[12px] text-[#9ca3af] mt-1">
                      Choose a conversation from the sidebar to start messaging.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {mainMessages.map((m) => {
                    const mine = m.sender_id === user?.id;
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[640px] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                          mine
                            ? "bg-[#7EB0AB] text-white"
                            : "bg-white border border-[#e5e7eb] text-[#1a1a1a]"
                        }`}>
                          {m.type === "image" && m.file_path ? (
                            <div className="space-y-2">
                              <Image
                                src={`http://127.0.0.1:8000/storage/${m.file_path}`}
                                alt="Shared image"
                                width={520}
                                height={360}
                                className="rounded-xl max-w-full h-auto"
                              />
                              {m.content && <div>{m.content}</div>}
                            </div>
                          ) : m.type === "file" ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span>📎</span>
                                <span className="font-semibold">{m.content}</span>
                              </div>
                              {m.file_path && (
                                <a
                                  href={`http://127.0.0.1:8000/storage/${m.file_path}`}
                                  target="_blank"
                                  className={`text-[12px] underline ${mine ? "text-white/90" : "text-[#7EB0AB]"}`}
                                >
                                  View File
                                </a>
                              )}
                            </div>
                          ) : (
                            m.content
                          )}
                          <div className={`mt-2 text-[10px] ${mine ? "text-white/80" : "text-[#9ca3af]"}`}>
                            {formatTime(m.created_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Composer */}
            <div className="px-7 py-4 border-t border-[#eef2f5] bg-white">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={(ref) => setFileInputRef(ref)}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef?.click()}
                  disabled={!selectedKey || isBlocked || Boolean(selectedGroupConversation)}
                  className="w-10 h-10 rounded-xl border border-[#e5e7eb] hover:bg-[#f9fafb] disabled:opacity-50 flex items-center justify-center text-[#5a6a75]"
                  title="Attach"
                >
                  📎
                </button>
                <button
                  type="button"
                  disabled={!selectedKey || isBlocked || Boolean(selectedGroupConversation)}
                  className="w-10 h-10 rounded-xl border border-[#e5e7eb] hover:bg-[#f9fafb] disabled:opacity-50 flex items-center justify-center text-[#5a6a75]"
                  title="Image"
                >
                  🖼
                </button>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder={
                    !selectedKey
                      ? "Select a conversation…"
                      : isBlocked
                        ? "You blocked this person"
                        : "Write a message…"
                  }
                  disabled={!selectedKey || isBlocked}
                  className="flex-1 px-4 py-3 rounded-2xl border border-[#e5e7eb] bg-white text-[13px] outline-none focus:ring-2 focus:ring-[#7EB0AB]/40 disabled:bg-[#f9fafb]"
                />

                <button
                  type="button"
                  disabled={
                    !selectedKey ||
                    isBlocked ||
                    sendingMessage ||
                    (!newMessage.trim() && !fileInputRef?.files?.[0])
                  }
                  onClick={() => {
                    if (selectedKey?.startsWith("group:")) sendGroupMessage();
                    else sendDmMessage();
                  }}
                  className="w-10 h-10 rounded-xl bg-[#7EB0AB] text-white font-extrabold hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
                  aria-label="Send"
                >
                  ➤
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Block confirmation modal (screenshot 4) */}
      {showBlockConfirm && (
        <div className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-7 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-[26px] mb-4">
              ⛔
            </div>
            <h3 className="text-[16px] font-extrabold text-[#1a1a1a]">
              Blocked this Person
            </h3>
            <p className="mt-1 text-[12px] text-[#9ca3af]">
              Are you sure you want to blocked this Person?
            </p>
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={confirmBlock}
                className="w-full py-3 rounded-xl bg-[#7EB0AB] text-white text-[12px] font-bold hover:opacity-90"
              >
                Blocked
              </button>
              <button
                type="button"
                onClick={() => setShowBlockConfirm(false)}
                className="w-full py-3 rounded-xl text-[12px] font-bold text-[#1a1a1a] border border-[#e5e7eb] hover:bg-[#f9fafb]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[400]">
          <div className="px-4 py-2 rounded-xl bg-[#1e3a4f] text-white text-[12px] font-semibold shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
