"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";
import styles from "./inbox.module.css";
import { useAuth } from "@/context/AuthContext";
import {
  getInboxMessages,
  getSentMessages,
  markAsRead,
  deleteMessage,
  requestReveal,
  acceptReveal,
  type Message,
} from "@/lib/firestore";

import {
  PackageOpen,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronLeft,
  Filter,
  Inbox as InboxIcon,
  Send as SendIcon,
  AlertTriangle,
  Copy,
  Share2,
  X,
  User as UserIcon,
  Ghost,
  Frown,
  Handshake,
  Heart,
  Smile,
  Mail,
  MoreVertical
} from "lucide-react";

const EMOTION_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  upset: { icon: <Frown size={20} />, label: "زعلان", color: "var(--emotion-upset)" },
  reconcile: { icon: <Handshake size={20} />, label: "عايز يصلّح", color: "var(--emotion-reconcile)" },
  miss: { icon: <Heart size={20} />, label: "وحشتك", color: "var(--emotion-miss)" },
  grateful: { icon: <Smile size={20} />, label: "ممتن", color: "var(--emotion-grateful)" },
  saraha: { icon: <Mail size={20} />, label: "صراحة", color: "var(--primary)" },
};

function formatDate(ts: any): string {
  if (!ts) return "الآن";
  if (ts.toDate) {
    return ts.toDate().toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return "وقت غير معروف";
}

export default function InboxPage() {
  const { showToast } = useToast();
  const { user, profile, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [loadingParams, setLoadingParams] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [filterEmotion, setFilterEmotion] = useState<string>("all");
  const [baseUrl, setBaseUrl] = useState("");

  // Set base URL after mount (client-side only)
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    let active = true;
    if (!authLoading) {
      if (user?.uid) {
        Promise.all([
          getInboxMessages(user.uid),
          getSentMessages(user.uid)
        ])
          .then(([inboxMsgs, sentMsgs]) => {
            if (active) {
              setMessages(inboxMsgs);
              setSentMessages(sentMsgs);
              setLoadingParams(false);
            }
          })
          .catch((e) => {
            console.error(e);
            if (active) setLoadingParams(false);
          });
      } else {
        setLoadingParams(false);
      }
    }
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const currentMessagesList = activeTab === "inbox" ? messages : sentMessages;
  const filteredMessages =
    filterEmotion === "all"
      ? currentMessagesList
      : currentMessagesList.filter((m) => m.emotion === filterEmotion);

  const unreadCount = messages.filter((m) => !m.isRead).length;

  // Handle click outside for more menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenMessage = async (msg: Message) => {
    setSelectedMessage({ ...msg, isRead: activeTab === "inbox" ? true : msg.isRead });
    if (activeTab === "inbox" && !msg.isRead) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
      );
      if (msg.id) {
        try {
          await markAsRead(msg.id);
        } catch (err) {
          console.error("Failed to mark as read", err);
        }
      }
    }
  };

  const handleRevealRequest = () => {
    if (!selectedMessage) return;
    setShowRevealModal(true);
  };

  const handleConfirmReveal = async () => {
    if (!selectedMessage?.id) return;
    try {
      await requestReveal(selectedMessage.id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === selectedMessage.id ? { ...m, matchStatus: "pending" } : m
        )
      );
      setSelectedMessage({ ...selectedMessage, matchStatus: "pending" });
      setShowRevealModal(false);
      showToast("تم إرسال طلب الكشف 💬 — مستنيين الطرف التاني", "info");
    } catch (err) {
      showToast("حصل مشكلة وإحنا بنبعت الطلب", "error");
    }
  };

  const handleAcceptReveal = async () => {
    if (!selectedMessage?.id) return;
    try {
      await acceptReveal(selectedMessage.id);
      setSentMessages((prev) =>
        prev.map((m) =>
          m.id === selectedMessage.id ? { ...m, matchStatus: "revealed" } : m
        )
      );
      setSelectedMessage({ ...selectedMessage, matchStatus: "revealed" });
      showToast("تم فتح الكلام 🎉 — دلوقتي هيشوف اسمك", "success");
    } catch (err) {
      showToast("حصل مشكلة", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage?.id) return;
    try {
      await deleteMessage(selectedMessage.id);
      if (activeTab === "inbox") {
        setMessages((prev) => prev.filter((m) => m.id !== selectedMessage?.id));
      } else {
        setSentMessages((prev) => prev.filter((m) => m.id !== selectedMessage?.id));
      }
      setSelectedMessage(null);
      showToast("تم حذف الرسالة 🗑️", "success");
    } catch (err) {
      showToast("مش قادرين نمسح الرسالة دلوقتي", "error");
    }
  };

  const handleReport = () => {
    setShowReportModal(false);
    showToast("شكراً على البلاغ — هنراجعه في أقرب وقت 🙏", "info");
  };

  return (
    <>
      <Navbar />

      <main className={`page-enter ${styles.inboxPage}`}>
        <div className="container-sm">
          {authLoading || loadingParams ? (
            <div className="spinner-overlay" style={{ minHeight: "60vh" }}>
              <div className="spinner" />
            </div>
          ) : !user ? (
            <div className="empty-state" style={{ marginTop: "10vh" }}>
              <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Lock size={40} />
              </div>
              <h3>لازم تسجل دخول الأول</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>عشان تقدر تشوف صندوق الرسايل بتاعك وتحمي خصوصيتك.</p>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                   document.querySelector<HTMLElement>(".btn.btn-primary.btn-sm")?.click();
                }}
              >
                تسجيل الدخول
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
          <div className={styles.inboxHeader}>
            <h1 className={styles.inboxTitle}>
              صندوقي
              {unreadCount > 0 && activeTab === "inbox" && (
                <span className={styles.unreadBadge}>{unreadCount}</span>
              )}
            </h1>
            <p className={styles.inboxSubtitle}>
              الرسائل اللي الناس بعتتهالك والرسائل اللي إنت بعتتها بكل صراحة.
            </p>
          </div>

          {/* Tabs */}
          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tabBtn} ${activeTab === "inbox" ? styles.active : ""}`}
              onClick={() => setActiveTab("inbox")}
            >
              <InboxIcon size={20} /> الوارد
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === "sent" ? styles.active : ""}`}
              onClick={() => setActiveTab("sent")}
            >
              <SendIcon size={20} /> المرسل
            </button>
          </div>

          {/* Emotion Filters */}
          <div className={styles.filterRow}>
            <button
              className={`${styles.filterChip} ${filterEmotion === "all" ? styles.filterActive : ""}`}
              onClick={() => setFilterEmotion("all")}
            >
              الكل <span className={styles.chipCount}>{currentMessagesList.length}</span>
            </button>
            {Object.entries(EMOTION_META).map(([key, meta]) => {
              const count = currentMessagesList.filter((m) => m.emotion === key).length;
              if (count === 0 && filterEmotion !== key) return null;
              return (
                <button
                  key={key}
                  className={`emotion-chip ${filterEmotion === key ? "active" : ""}`}
                  data-emotion={key}
                  onClick={() =>
                    setFilterEmotion(key === filterEmotion ? "all" : key)
                  }
                  style={{ gap: '6px' }}
                >
                  {meta.icon} <span className={styles.chipCount}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Messages List */}
          {filteredMessages.length === 0 ? (
            <div className="empty-state">
              <div style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <PackageOpen size={40} />
              </div>
              <h3 className="empty-state-title">لسه مفيش رسائل</h3>
              <p className="empty-state-text" style={{ marginBottom: '2rem' }}>
                شارك رابط صراحتك وشوف الناس عايزة تقولك إيه ✨
              </p>
              <button
                className="btn btn-primary btn-lg"
                style={{ gap: '10px' }}
                onClick={() => {
                  navigator.clipboard.writeText(
                    baseUrl + "/u/" + profile?.username
                  );
                  showToast("تم نسخ الرابط! شاركه الآن ✨", "success");
                }}
              >
                <Share2 size={20} /> شارك الرابط
              </button>
            </div>
          ) : (
            <div className={styles.messagesList}>
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-card ${styles.inboxCard} ${!msg.isRead ? styles.unread : ""}`}
                  data-emotion={msg.emotion}
                  onClick={() => handleOpenMessage(msg)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardEmotion}>
                      <span className={styles.emotionIcon} style={{ color: EMOTION_META[msg.emotion]?.color }}>
                        {EMOTION_META[msg.emotion]?.icon}
                      </span>
                      <span className={styles.emotionLabel}>
                        {EMOTION_META[msg.emotion]?.label}
                      </span>
                    </div>
                    <div className={styles.cardMeta}>
                      {activeTab === "inbox" ? (
                        <span
                          className={`badge ${msg.isAnonymous ? "badge-anon" : "badge-known"}`}
                          style={{ gap: '6px' }}
                        >
                          {msg.isAnonymous ? <><Ghost size={12} /> مجهول</> : <><UserIcon size={12} /> {msg.senderName}</>}
                        </span>
                      ) : (
                        <span className="badge badge-known" style={{ gap: '6px' }}>
                          <UserIcon size={12} /> {msg.recipientUsername}
                        </span>
                      )}
                      {activeTab === "inbox" && !msg.isRead && <span className={styles.unreadDot} />}
                    </div>
                  </div>
                  <p className={styles.cardText}>{msg.rewrittenText}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardTime}>{formatDate(msg.createdAt)}</span>
                    {msg.matchStatus === "pending" && (
                      <span className={styles.matchPending} style={{ gap: '6px' }}>
                        <Clock size={12} /> مستنيين رد
                      </span>
                    )}
                    {msg.matchStatus === "revealed" && (
                      <span className={styles.matchRevealed} style={{ gap: '6px' }}>
                        <CheckCircle2 size={12} /> اتكشف
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Share CTA */}
          <div className={styles.shareCta}>
            <div className={`glass-card ${styles.shareCard}`}>
              <p>شارك صندوقك عشان تستقبل رسائل أكتر ✨</p>
              <button
                className="btn btn-primary btn-sm"
                style={{ gap: "8px" }}
                onClick={() => {
                  navigator.clipboard.writeText(
                    baseUrl + "/u/" + profile?.username
                  );
                  showToast("تم نسخ الرابط! ✨", "success");
                }}
              >
                <Copy size={16} /> انسخ اللينك
              </button>
            </div>
          </div>
            </>
          )}
        </div>
      </main>

      {/* Message Detail Modal */}
      <Modal
        isOpen={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        title={
          selectedMessage ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: EMOTION_META[selectedMessage.emotion]?.color }}>
                {EMOTION_META[selectedMessage.emotion]?.icon}
              </span>
              <span>{EMOTION_META[selectedMessage.emotion]?.label}</span>
            </div>
          ) : ""
        }
        footer={
          selectedMessage && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                width: "100%",
                flexWrap: "wrap",
              }}
            >
              {activeTab === "inbox" && selectedMessage.isAnonymous &&
                selectedMessage.matchStatus === "none" && (
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, gap: '8px' }}
                    onClick={handleRevealRequest}
                  >
                    <Unlock size={18} /> فتح كلام
                  </button>
                )}

              {activeTab === "sent" && selectedMessage.matchStatus === "pending" && (
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, gap: '8px' }}
                  onClick={handleAcceptReveal}
                >
                  <CheckCircle2 size={18} /> موافق على كشف الهوية
                </button>
              )}

              {selectedMessage.matchStatus === "revealed" && activeTab === "inbox" && (
                <a
                  href={`https://wa.me/${selectedMessage.senderWhatsapp ? selectedMessage.senderWhatsapp.replace(/[^0-9]/g, '') : ""}?text=${encodeURIComponent("أهلاً.. المسامح كريم 🤝 — خلينا نتكلم!")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ flex: 1, gap: '8px' }}
                >
                  <Share2 size={18} /> واتساب
                </a>
              )}
              
              {selectedMessage.matchStatus === "revealed" && activeTab === "sent" && (
                <div style={{ flex: 1, textAlign: "center", padding: "12px", background: "var(--primary-glow)", borderRadius: "12px", color: "var(--primary)", fontWeight: "500", fontSize: "0.9rem" }}>
                  تم كشف هويتك للطرف الآخر بنجاح! 🎉
                </div>
              )}
              {(!selectedMessage.isAnonymous && activeTab === "inbox" && selectedMessage.matchStatus !== "revealed") && (
                <a
                  href={`https://wa.me/${selectedMessage.senderWhatsapp ? selectedMessage.senderWhatsapp.replace(/[^0-9]/g, '') : ""}?text=${encodeURIComponent("أهلاً.. المسامح كريم 🤝 — خلينا نتكلم!")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ flex: 1, gap: '8px' }}
                >
                  <Share2 size={18} /> واتساب
                </a>
              )}
                {/* Desktop View: Actions visible */}
                <div className="hide-mobile" style={{ gap: '8px' }}>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => setShowReportModal(true)}
                    title="إبلاغ"
                  >
                    <AlertTriangle size={18} />
                  </button>
                  <button 
                    className="btn btn-ghost btn-icon" 
                    onClick={handleDelete}
                    title="حذف"
                    style={{ color: 'var(--emotion-upset)' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Mobile View: Actions in Dropdown */}
                <div className="hide-desktop">
                  <div className="dropdown-container" ref={moreMenuRef}>
                    <button 
                      className={`btn btn-ghost btn-icon ${showMoreMenu ? 'active' : ''}`}
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                      title="المزيد"
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    <div className={`dropdown-menu ${showMoreMenu ? 'dropdown-active' : ''} dropdown-menu-up mobile-bottom-sheet`} style={{ right: 'auto', left: 0 }}>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setShowReportModal(true);
                          setShowMoreMenu(false);
                        }}
                      >
                        <AlertTriangle size={18} /> إبلاغ
                      </button>
                      <div className="dropdown-divider" />
                      <button 
                        className="dropdown-item dropdown-item-danger" 
                        onClick={() => {
                          handleDelete();
                          setShowMoreMenu(false);
                        }}
                      >
                        <Trash2 size={18} /> حذف الرسالة
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          )
        }
      >
        {selectedMessage && (
          <div>
            <div className={styles.detailMeta}>
              {activeTab === "inbox" ? (
                <span
                  className={`badge ${
                    (selectedMessage.isAnonymous && selectedMessage.matchStatus !== "revealed")
                      ? "badge-anon"
                      : "badge-known"
                  }`}
                  style={{ gap: '6px' }}
                >
                  {(selectedMessage.isAnonymous && selectedMessage.matchStatus !== "revealed")
                    ? <><Ghost size={12} /> مجهول</>
                    : <><UserIcon size={12} /> {selectedMessage.senderName || "مستخدم"}</>}
                </span>
              ) : (
                <span className="badge badge-known" style={{ gap: '6px' }}>
                  <UserIcon size={12} /> {selectedMessage.recipientUsername}
                </span>
              )}
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", gap: '4px', display: 'flex', alignItems: 'center' }}>
                <Clock size={12} /> {formatDate(selectedMessage.createdAt)}
              </span>
            </div>

            <div className={styles.detailBubble}>
              {selectedMessage.rewrittenText}
            </div>

            {selectedMessage.matchStatus === "pending" && (
              <div className={styles.matchInfo} style={{ background: 'var(--primary-glow)', border: '1px dashed var(--primary)' }}>
                <Clock size={20} color="var(--primary)" />
                <p style={{ color: 'var(--primary)', fontWeight: '500' }}>
                  {activeTab === "inbox" 
                    ? "تم إرسال طلب فتح كلام.. مستنيين الطرف التاني يوافق."
                    : "الطرف التاني طلب يعرف إنت مين.. مستني موافقتك عشان تفتحوا كلام."}
                </p>
              </div>
            )}

            {selectedMessage.matchStatus === "revealed" && (
              <div className={`${styles.matchInfo} ${styles.matchSuccess}`} style={{ background: 'var(--emotion-reconcile-light)', border: '1px dashed var(--emotion-reconcile)' }}>
                <CheckCircle2 size={20} color="var(--emotion-reconcile)" />
                <p style={{ color: 'var(--emotion-reconcile)', fontWeight: '600' }}>اتصالحتوا! دلوقتي تقدروا تتواصلوا على واتساب فوراً.</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reveal Consent Modal */}
      <Modal
        isOpen={showRevealModal}
        onClose={() => setShowRevealModal(false)}
        title="فتح كلام؟"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, gap: '8px' }}
              onClick={handleConfirmReveal}
            >
              <Unlock size={18} /> آه، عايز أعرف
            </button>
            <button
              className="btn btn-secondary"
              style={{ flex: 1, gap: '8px' }}
              onClick={() => setShowRevealModal(false)}
            >
              <X size={18} /> خلّيها سر
            </button>
          </div>
        }
      >
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Unlock size={32} />
          </div>
          <p
            style={{
              color: "var(--text-secondary)",
              lineHeight: 2,
              fontSize: "1rem",
            }}
          >
            لو ضغطت &quot;آه&quot; — هنبعت إشارة للمرسل.
            <br />
            لو هو وافق كمان — الاتنين هتعرفوا بعض.
            <br />
            <strong style={{ color: "var(--text-primary)" }}>
              مفيش كشف من طرف واحد ✅
            </strong>
          </p>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="إبلاغ عن محتوى"
        footer={
          <button className="btn btn-danger btn-block" onClick={handleReport}>
            إرسال البلاغ
          </button>
        }
      >
        <div className="form-group" style={{ gap: "12px" }}>
          <label className="form-label">السبب:</label>
          {["مزعج / سبام", "محتوى مسيء", "تحرش", "سبب تاني"].map(
            (reason, i) => (
              <label key={i} className={styles.radioLabel}>
                <input type="radio" name="report_reason" value={reason} />
                <span>{reason}</span>
              </label>
            )
          )}
        </div>
      </Modal>
    </>
  );
}
