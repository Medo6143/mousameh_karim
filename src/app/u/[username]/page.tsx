"use client";

import React, { useState, use, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";
import styles from "./profile.module.css";
import { useAuth } from "@/context/AuthContext";
import { getUserByUsername, sendMessage, updateUserProfileData, type UserProfile } from "@/lib/firestore";
import { 
  Frown, 
  Handshake, 
  Heart, 
  Smile, 
  Mail, 
  Camera, 
  Edit2, 
  Copy, 
  Send, 
  User as UserIcon,
  Home,
  ChevronRight,
  AlertTriangle,
  Globe,
  Settings,
  X,
  CheckCircle2,
  Lock,
  Ghost,
  Inbox,
  Sparkles,
  PenTool,
  Bot,
  Share2
} from "lucide-react";

const EMOTIONS = [
  { key: "upset", icon: <Frown size={24} />, label: "زعلان" },
  { key: "reconcile", icon: <Handshake size={24} />, label: "عايز أصلّح" },
  { key: "miss", icon: <Heart size={24} />, label: "وحشتني" },
  { key: "grateful", icon: <Smile size={24} />, label: "ممتن" },
  { key: "saraha", icon: <Mail size={24} />, label: "صراحة" },
];

const COUNTRY_CODES = [
  { code: "+20", name: "مصر" },
  { code: "+966", name: "السعودية" },
  { code: "+971", name: "الإمارات" },
  { code: "+965", name: "الكويت" },
  { code: "+974", name: "قطر" },
  { code: "+968", name: "عمان" },
  { code: "+962", name: "الأردن" },
  { code: "+212", name: "المغرب" },
];

// Removed simulated rewrite function as we use real AI now

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { showToast } = useToast();
  const { user, profile: authProfile } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [messageText, setMessageText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [step, setStep] = useState<"write" | "preview" | "done">("write");
  const [rewrittenText, setRewrittenText] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [useManualWrite, setUseManualWrite] = useState(false);
  
  // Edit Profile States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [countryCode, setCountryCode] = useState("+20");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  // Set base URL after mount (client-side only)
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    async function load() {
      const p = await getUserByUsername(username);
      setProfile(p);
      if (p) {
        setEditDisplayName(p.displayName);
        setEditBio(p.bio || "");
        
        // Parse whatsapp into country code + number
        const wa = p.whatsapp || "";
        const detectedCode = COUNTRY_CODES.find(c => wa.startsWith(c.code));
        if (detectedCode) {
          setCountryCode(detectedCode.code);
          setPhoneNumber(wa.replace(detectedCode.code, "").trim());
        } else {
          setPhoneNumber(wa);
        }
      }
      setProfileLoading(false);
    }
    load();
  }, [username]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || user.uid !== profile?.uid) return;

    const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_KEY;
    if (!imgbbKey) {
      showToast("لازم تضيف مفتاح NEXT_PUBLIC_IMGBB_KEY في ملف .env.local", "error");
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        const photoURL = data.data.url;
        await updateUserProfileData(user.uid, { photoURL });
        setProfile((prev) => prev ? { ...prev, photoURL } : prev);
        showToast("تم تحديث الصورة بنجاح! 🖼️", "success");
      } else {
        console.error("ImgBB Error:", data);
        showToast(`فشل الرفع: ${data.error?.message || "مفتاح الـ API غير صالح"}`, "error");
      }
    } catch (err) {
      showToast("مشكلة في الاتصال (رفع الصورة).", "error");
    }
    setUploadingAvatar(false);
  };

  const handleSaveProfile = async () => {
    if (!profile || !user || user.uid !== profile.uid) return;
    
    // Simple validation
    if (phoneNumber && !/^[\d\s-]{6,15}$/.test(phoneNumber)) {
      showToast("رقم التليفون مش مظبوط، اتأكد من الأرقام.", "warning");
      return;
    }

    const fullWhatsapp = phoneNumber ? `${countryCode}${phoneNumber.replace(/\s+/g, '')}` : "";

    try {
      await updateUserProfileData(profile.uid, {
        displayName: editDisplayName,
        bio: editBio,
        whatsapp: fullWhatsapp
      });
      const updatedProfile = await getUserByUsername(username);
      setProfile(updatedProfile);
      setIsEditingProfile(false);
      showToast("تم تحديث حسابك بنجاح! ✨", "success");
    } catch (e) {
      console.error(e);
      showToast("حصلت مشكلة وإحنا بنحدّث الحساب.", "error");
    }
  };

  const generateAISuggestions = async () => {
    if (!selectedEmotion) {
      showToast("اختار الإحساس اللي عايز تعبر عنه الأول", "warning");
      return;
    }

    setIsRewriting(true);
    setAiSuggestions([]);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Empty text to trigger multiple suggestions
        body: JSON.stringify({ text: "", emotion: selectedEmotion }),
      });
      const data = await res.json();
      if (res.ok && data.suggestions && data.suggestions.length > 0) {
        setAiSuggestions(data.suggestions);
      } else {
        showToast("حصل مشكلة مع الـ AI في التوليد.", "error");
      }
    } catch (err) {
      showToast("خطأ في الاتصال بالشبكة.", "error");
    }
    setIsRewriting(false);
  };

  const handleSend = async (directSend = false) => {
    if (!profile) return;
    
    // Only saraha messages allowed without login
    if (!user && selectedEmotion !== "saraha") {
      showToast("عشان تبعت رسايل المصالحة والعتاب، لازم تسجل دخول 🙏", "warning");
      return;
    }
    
    // Validate again if sending directly
    if (directSend) {
      if (!selectedEmotion) {
        showToast("اختار الإحساس اللي عايز تعبر عنه الأول", "warning");
        return;
      }
      if (messageText.trim().length < 5) {
        showToast("اكتب رسالة كاملة عشان التاني يفهمك 😊", "warning");
        return;
      }
    }

    setIsSending(true);
    try {
      await sendMessage({
        recipientUid: profile.uid,
        recipientUsername: profile.username,
        senderUid: user?.uid,
        senderName: user?.displayName || "مستخدم",
        senderWhatsapp: authProfile?.whatsapp || "",
        emotion: selectedEmotion as any,
        originalText: messageText,
        rewrittenText: directSend ? messageText : rewrittenText,
        isAnonymous: user ? isAnonymous : true, // force true if not logged in
      });
      setStep("done");
      showToast("الرسالة اتبعتت ✅ — والمسامح كريم 🤝", "success");
    } catch (err) {
      showToast("حصلت مشكلة وإحنا بنبعت الرسالة.", "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleEdit = () => {
    setStep("write");
  };

  const handleNewMessage = () => {
    setSelectedEmotion("");
    setMessageText("");
    setRewrittenText("");
    setAiSuggestions([]);
    setUseManualWrite(false);
    setStep("write");
  };

  return (
    <>
      <Navbar />

      <main className={`page-enter ${styles.profilePage}`}>
        <div className="container-sm">
          {profileLoading ? (
            <div className="spinner-overlay" style={{ minHeight: "60vh" }}>
              <div className="spinner" />
            </div>
          ) : !profile ? (
            <div className="empty-state">
              <h3>الصفحة دي مش موجودة 🤷‍♂️</h3>
              <p>تأكد من لينك المستخدم مرة تانية.</p>
            </div>
          ) : (
            <>
              {/* Profile Header */}
              <div className={styles.profileHeader}>
                <div 
                  className={`avatar avatar-xl ${styles.profileAvatar}`}
                  style={{ position: 'relative', overflow: 'hidden' }}
                >
                  {profile.photoURL ? (
                    <img 
                      src={profile.photoURL} 
                      alt={profile.displayName} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    profile.displayName.charAt(0)
                  )}
                  {uploadingAvatar && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="spinner" style={{ width: 20, height: 20, borderTopColor: '#fff' }} />
                    </div>
                  )}
                  {user?.uid === profile.uid && !uploadingAvatar && (
                    <label 
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        fontSize: '12px',
                        cursor: 'pointer',
                        padding: '4px 0',
                        textAlign: 'center'
                      }}
                    >
                      تغيير
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarUpload} 
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
                <h1 className={styles.profileName}>{profile.displayName}</h1>
                <p className={styles.profileBio}>{profile.bio || "مفيش بايو لسه.. بس المسامح كريم ✨"}</p>
                <div className={styles.profileStats}>
                  <div className="stat-pill">
                    <Send size={16} /> استقبل{" "}
                    <strong>{profile.messageCount || 0}</strong> رسالة
                  </div>
                </div>
                {user?.uid === profile.uid && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: "1rem", gap: '8px' }}
                    onClick={() => setIsEditingProfile(true)}
                  >
                    <Settings size={16} /> إعدادات الحساب
                  </button>
                )}
              </div>

          {/* ===== STEP 1: Write Message ===== */}
          {user?.uid === profile.uid ? (
            <div className={`glass-card ${styles.messageForm}`} style={{ textAlign: "center" }}>
              {isEditingProfile ? (
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>تعديل الحساب</h3>
                    <button className="btn btn-ghost btn-icon" onClick={() => setIsEditingProfile(false)}>
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: "1.2rem" }}>
                    <label className="form-label">الاسم اللي هيظهر للناس</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: "1.2rem" }}>
                    <label className="form-label">رقم الواتساب (للتواصل بعد الصلح)</label>
                    <div style={{ display: 'flex', gap: '8px', direction: 'ltr' }}>
                      <select 
                        className="form-input" 
                        style={{ width: '100px', padding: '14px 8px' }}
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                      >
                        {COUNTRY_CODES.map(c => (
                          <option key={c.code} value={c.code}>{c.code} {c.name}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="1012345678"
                        style={{ flex: 1 }}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      الرقم مش هيظهر لأي حد غير لما توافقوا الطرفين على الصلح.
                    </p>
                  </div>

                  <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                    <label className="form-label">كلمتين عنك (بايو)</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="مثلاً: سامحوني لو قصرت في حق حد.."
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveProfile}>
                      حفظ التغييرات
                    </button>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditingProfile(false)}>
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Home size={40} />
                  </div>
                  <h3>أهلاً بك في صفحتك</h3>
                  <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
                    دي مساحتك الخاصة لاستقبال رسايل المصالحة والعتاب.
                  </p>
                  <Link href="/inbox" className="btn btn-primary btn-lg btn-block" style={{ gap: '10px', marginBottom: '1rem' }}>
                    <Inbox size={20} /> عرض صندوق الوارد
                  </Link>
                  <button
                    className="btn btn-secondary btn-block"
                    style={{ gap: '10px' }}
                    onClick={() => {
                      navigator.clipboard.writeText(baseUrl + "/u/" + profile.username);
                      showToast("تم نسخ الرابط! شاركه الآن ✨", "success");
                    }}
                  >
                    <Copy size={18} /> نسخ رابط الصندوق
                  </button>
                </>
              )}
            </div>
          ) : step === "write" && (
            <div className={`glass-card ${styles.messageForm}`}>
              <h2 className={styles.formTitle}>
                ابعت رسالة لـ {profile.displayName}
              </h2>

              {/* Emotion Selection */}
              <div className={styles.formSection}>
                <label className="form-label">إنت حاسس بإيه؟</label>
                <div className={styles.emotionGrid}>
                  {EMOTIONS.map((em) => (
                    <button
                      key={em.key}
                      className={`emotion-chip ${selectedEmotion === em.key ? "active" : ""}`}
                      data-emotion={em.key}
                      onClick={() => {
                        setSelectedEmotion(em.key);
                        setAiSuggestions([]); // Reset suggestions if emotion changes
                      }}
                      style={{ gap: '8px' }}
                    >
                      {em.icon} {em.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Generation / Manual Logic */}
              {selectedEmotion && !useManualWrite && (
                <div className={styles.formSection} style={{ marginTop: '1.5rem' }}>
                  {aiSuggestions.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button 
                        className="btn btn-primary btn-lg btn-block" 
                        onClick={generateAISuggestions} 
                        disabled={isRewriting}
                        style={{ gap: '10px' }}
                      >
                        {isRewriting ? "جاري التفكير.. 🧠" : <><Bot size={20} /> اقترح عليا رسايل بالـ AI</>}
                      </button>
                      <button className="btn btn-ghost" onClick={() => setUseManualWrite(true)}>
                         أو اكتب رسالتك بنفسك <PenTool size={16} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <label className="form-label" style={{ marginBottom: '0.5rem' }}>اختر الرسالة الأنسب:</label>
                      {aiSuggestions.map((s, idx) => (
                        <button 
                          key={idx} 
                          className="btn btn-secondary" 
                          style={{ textAlign: 'right', whiteSpace: 'normal', padding: '16px', fontSize: '0.95rem', lineHeight: '1.6' }}
                          onClick={() => {
                            setMessageText(s);
                            setRewrittenText(s);
                            setStep("preview");
                          }}
                        >
                          {s}
                        </button>
                      ))}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={generateAISuggestions} disabled={isRewriting}>
                          اقتراحات تانية <Sparkles size={16} />
                        </button>
                        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setUseManualWrite(true)}>
                          هكتب أنا <PenTool size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedEmotion && useManualWrite && (
                <div className={styles.formSection} style={{ marginTop: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">اكتب اللي جوّاك بكل صراحة</label>
                    <textarea
                      className="form-textarea"
                      placeholder="عايز تقول إيه.."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      maxLength={500}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                      <span className={styles.charCount}>{messageText.length}/500</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setUseManualWrite(false); setAiSuggestions([]); }}>
                        استخدم الـ AI بدلاً من هذا <Bot size={14} />
                      </button>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary btn-lg btn-block" 
                    style={{ marginTop: '1.5rem', gap: '10px' }}
                    disabled={isSending || isRewriting}
                    onClick={() => {
                      setRewrittenText(messageText);
                      setStep("preview");
                    }}
                  >
                     معاينة الرسالة <ChevronRight size={20} />
                  </button>
                </div>
              )}

              {/* Anonymous Toggle (only show if logged in, otherwise forced anonymous) */}
              {user && (
                <div className={styles.formSection}>
                  <div className={styles.anonToggle}>
                    <button
                      className={`${styles.anonOption} ${isAnonymous ? styles.anonActive : ""}`}
                      onClick={() => setIsAnonymous(true)}
                    >
                      <Ghost size={18} /> مجهول
                    </button>
                    <button
                      className={`${styles.anonOption} ${!isAnonymous ? styles.anonActive : ""}`}
                      onClick={() => setIsAnonymous(false)}
                    >
                      <UserIcon size={18} /> باسمي
                    </button>
                  </div>
                  <p className={styles.anonHint}>
                    {isAnonymous
                      ? "الرسالة هتوصلك باسم مجهول، بس لازم تسجل دخول عشان لو حبيت تقبل كشف الهوية."
                      : "اسمك الحقيقي هيبان مع الرسالة."}
                  </p>
                </div>
              )}

              {!user && selectedEmotion !== "saraha" ? (
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <p style={{ color: "var(--text-secondary)", marginBottom: "12px", fontSize: "0.9rem" }}>
                    عشان تقدر تبعت دي، لازم تسجل دخول (رسايل الصراحة بس اللي مش محتاجة تسجيل):
                  </p>
                  <button
                    className="btn btn-secondary btn-lg btn-block"
                    onClick={() => document.querySelector<HTMLElement>(".btn.btn-primary.btn-sm")?.click()}
                    style={{ gap: '10px' }}
                  >
                    <Lock size={18} /> سجل دخول لعقد مصالحة
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {/* ===== STEP 2: AI Preview ===== */}
          {step === "preview" && (
            <div className={`glass-card ${styles.messageForm}`}>
              {isRewriting ? (
                <div className="spinner-overlay">
                  <div className="spinner" />
                  <p style={{ color: "var(--text-secondary)" }}>
                    الـ AI بيصيغ رسالتك... 🤖
                  </p>
                </div>
              ) : (
                <>
                  <h2 className={styles.formTitle}>معاينة أخيرة للرسالة</h2>

                  <div className={styles.previewSection}>
                    <div className={styles.previewLabel}>
                      <span
                        className={`emotion-chip active`}
                        data-emotion={selectedEmotion}
                      >
                        {EMOTIONS.find((e) => e.key === selectedEmotion)?.icon}
                        <span style={{ marginRight: '8px' }}>{EMOTIONS.find((e) => e.key === selectedEmotion)?.label}</span>
                      </span>
                      <span className={`badge ${isAnonymous ? "badge-anon" : "badge-known"}`} style={{ gap: '6px' }}>
                        {isAnonymous ? <><Ghost size={14} /> مجهول</> : <><UserIcon size={14} /> باسمك</>}
                      </span>
                    </div>

                    <textarea
                      className={`form-textarea ${styles.previewBubble}`}
                      style={{ fontSize: '1.2rem', minHeight: '120px', width: '100%', marginBottom: '1rem' }}
                      value={rewrittenText}
                      onChange={(e) => setRewrittenText(e.target.value)}
                    />

                    <p className={styles.previewNote}>
                      تم تعديل الرسالة وتحسينها، تقدر تعدل أي كلمة قبل ما تبعت.
                    </p>
                  </div>

                  <div className={styles.previewActions}>
                    <button className="btn btn-primary btn-lg" style={{ flex: 2, gap: '10px' }} onClick={() => handleSend(false)} disabled={isSending}>
                      {isSending ? "جاري الإرسال.." : <><Send size={20} /> ابعت الرسالة الآن</>}
                    </button>
                    <button className="btn btn-secondary btn-lg" style={{ flex: 1, gap: '8px' }} onClick={handleEdit} disabled={isSending}>
                      <Edit2 size={18} /> تعديل
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ===== STEP 3: Done ===== */}
          {step === "done" && (
            <div className={`glass-card ${styles.messageForm} ${styles.doneCard}`}>
              <div className={styles.doneIcon} style={{ background: 'var(--emotion-reconcile)', border: 'none' }}>
                <CheckCircle2 size={48} color="white" />
              </div>
              <h2 className={styles.doneTitle}>تم الإرسال بنجاح!</h2>
              <p className={styles.doneText}>
                الرسالة دلوقتي في طريقها.. والمسامح كريم. ✨
                <br />
                خصوصيتك محفوظة تماماً ولا يتم كشف الهوية إلا بموافقتك.
              </p>

              <div className={styles.doneActions}>
                <button className="btn btn-primary btn-lg btn-block" onClick={handleNewMessage} style={{ gap: '10px' }}>
                  <Send size={20} /> إرسال رسالة أخرى
                </button>
                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1, gap: '8px' }}
                    onClick={() => {
                      navigator.clipboard.writeText(baseUrl + "/u/" + profile.username);
                      showToast("تم نسخ الرابط! ✨", "success");
                    }}
                  >
                    <Copy size={16} /> نسخ الرابط
                  </button>
                  <a
                    href={baseUrl ? `https://wa.me/?text=${encodeURIComponent(
                      `📬 عندي صندوق مسامحة — لو عندك كلام تقوله من غير إحراج:\n${baseUrl}/u/${profile.username}`
                    )}` : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ flex: 1, gap: '8px' }}
                  >
                    <Share2 size={16} /> واتساب
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Report Button */}
          <div className={styles.reportSection}>
            <button
              className="btn btn-ghost"
              onClick={() => setShowReportModal(true)}
              style={{ fontSize: "0.85rem", gap: '6px' }}
            >
              <AlertTriangle size={14} /> الإبلاغ عن محتوى غير لائق
            </button>
          </div>
            </>
          )}
        </div>
      </main>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="إرسال بلاغ"
        footer={
          <button
            className="btn btn-danger btn-block"
            onClick={() => {
              setShowReportModal(false);
              showToast("شكراً جزيلاً! هنراجع البلاغ فوراً. 🙏", "info");
            }}
          >
            إرسال البلاغ
          </button>
        }
      >
        <div className="form-group" style={{ gap: "12px" }}>
          <label className="form-label">السبب:</label>
          {["محتوى مسيء", "تحرش", "سبام / إزعاج", "سبب تاني"].map(
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
