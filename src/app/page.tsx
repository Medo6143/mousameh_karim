"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Bot, 
  MessageSquare, 
  Share2, 
  Heart, 
  Handshake, 
  Frown, 
  Smile, 
  Send,
  Sparkles,
  ArrowRight,
  UserPlus,
  QrCode
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";

const EMOTIONS = [
  { key: "upset", icon: <Frown size={24} />, label: "زعلان", color: "#e57373" },
  { key: "reconcile", icon: <Handshake size={24} />, label: "عايز أصلّح", color: "#81c784" },
  { key: "miss", icon: <Heart size={24} />, label: "وحشتني", color: "#64b5f6" },
  { key: "grateful", icon: <Smile size={24} />, label: "ممتن", color: "#ffd54f" },
];

const FEATURES = [
  {
    icon: <ShieldCheck size={32} />,
    title: "خصوصية تامة",
    desc: "هويتك مش بتظهر أبداً للطرف التاني إلا لو وافقت إنت وهو بالتبادل.",
  },
  {
    icon: <Bot size={32} />,
    title: "ذكاء اصطناعي لطيف",
    desc: "الـ AI بيساعدك تختار كلمات رقيقة حتى لو كنت حاسس بالزعل والغضب.",
  },
  {
    icon: <MessageSquare size={32} />,
    title: "كسر الحواجز",
    desc: "أناقة في العتاب وهدوء في المصالحة. بنخلي الرجوع أسهل خطوة.",
  },
  {
    icon: <Share2 size={32} />,
    title: "سهولة المشاركة",
    desc: "صندوقك الشخصي جاهز للمشاركة على واتساب وسوشيال ميديا.",
  },
];

const TESTIMONIALS = [
  {
    text: "بعتت لصاحبي بعد سنة خناقة... اتصالحنا في نص ساعة 😭",
    name: "أحمد م.",
  },
  {
    text: "مكنتش عارفة أبتدي ازاي. التطبيق ده حل المشكلة.",
    name: "نورا ع.",
  },
  {
    text: "جالي رسالة من حد مجهول بيقولي وحشتني... يومي اتغير ❤️",
    name: "كريم ح.",
  },
];

export default function LandingPage() {
  const { showToast } = useToast();
  const { user, profile, loading, signInWithGoogle } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [baseUrl, setBaseUrl] = useState("");
  const [floatingEmojis, setFloatingEmojis] = useState<
    { id: number; emoji: string; left: number; delay: number }[]
  >([]);

  // Set base URL after mount (client-side only)
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  // Cycle testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Generate floating emojis
  useEffect(() => {
    const emojis = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      emoji: ["💌", "🤝", "💙", "✨", "🕊️", "❤️", "🙏", "💫"][i % 8],
      left: Math.random() * 100,
      delay: Math.random() * 8,
    }));
    setFloatingEmojis(emojis);
  }, []);

  const handleShareClick = async () => {
    if (!user) {
      // Direct sign in if not logged in
      try {
        await signInWithGoogle();
        showToast("أهلاً بك! تقدر دلوقتي تشارك صندوقك 🤝", "success");
      } catch (error: any) {
        // Use console.log instead of error to avoid triggering the Next.js dev overlay crash
        console.log("Sign in skipped or failed:", error.message || error);
        if (error.code !== "auth/popup-closed-by-user") {
          showToast("عفواً، فشل تسجيل الدخول. حاول تاني لو سمحت.", "error");
        }
      }
      return;
    }
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    const username = profile?.username || "demo_user";
    const shareUrl = `${window.location.origin}/u/${username}`;
    navigator.clipboard.writeText(shareUrl);
    showToast("تم نسخ اللينك! شاركه على واتساب 📲", "success");
    setShowShareModal(false);
  };

  return (
    <>
      <Navbar />

      <main>
        {/* ===== HERO SECTION ===== */}
        <section className={styles.hero}>
          {/* Floating emojis */}
          <div className={styles.floatingEmojis}>
            {floatingEmojis.map((e) => (
              <span
                key={e.id}
                className={styles.floatingEmoji}
                style={
                  {
                    left: `${e.left}%`,
                    animationDelay: `${e.delay}s`,
                    "--float-duration": `${12 + Math.random() * 8}s`,
                  } as React.CSSProperties
                }
              >
                {e.emoji}
              </span>
            ))}
          </div>

          <div className={`container ${styles.heroContent}`}>
            <div className={styles.heroBadge}>
              <Sparkles size={16} /> منصة المصالحة الأولى عربياً
            </div>

            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleGradient}>المسامح كريم</span>
              <br />
              يا عم
            </h1>

            <p className={styles.heroSubtitle}>
              حوّل عتابك لمصالحة بلمسة ذكاء اصطناعي.
              <br />
              تواصل مع اللي بتحبهم بهدوء، خصوصية، وبدون إحراج.
            </p>

            {/* Emotion Chips */}
            <div className={styles.heroEmotions}>
              {EMOTIONS.map((em) => (
                <span
                  key={em.key}
                  className={`emotion-chip ${styles.heroChip}`}
                  data-emotion={em.key}
                  style={{ gap: '10px' }}
                >
                  {em.icon} {em.label}
                </span>
              ))}
            </div>

            <div className={styles.heroActions}>
              <button
                className={`btn btn-primary btn-lg ${styles.mainCta}`}
                onClick={handleShareClick}
              >
                <QrCode size={20} /> شارك صندوقك 
              </button>
            </div>

            {/* Stats */}
            <div className={styles.heroStats}>
              <div className="stat-pill">
                <Send size={16} /> <strong>12,847</strong> رسالة
              </div>
              <div className="stat-pill">
                <Handshake size={16} /> <strong>3,421</strong> مصالحة
              </div>
              <div className="stat-pill">
                <UserPlus size={16} /> <strong>8,920</strong> مستخدم
              </div>
            </div>
          </div>

          {/* Gradient orbs */}
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
          <div className={styles.heroOrb3} />
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className={`section ${styles.howSection}`}>
          <div className="container">
            <h2 className={styles.sectionTitle}>
              ازاي بيشتغل؟
            </h2>
            <p className={styles.sectionSubtitle}>
              3 خطوات بس — وكلامك يوصل بطريقة كريمة
            </p>

            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>١</div>
                <div className={styles.stepIcon}><UserPlus /></div>
                <h3>افتح حسابك</h3>
                <p>
                  سجل دخول في ثواني، وحدد اسم المستخدم بتاعك عشان الناس تعرف تبعتلك.
                </p>
              </div>

              <div className={styles.stepConnector}>
                <ArrowRight size={24} color="var(--primary)" />
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>٢</div>
                <div className={styles.stepIcon}><Share2 /></div>
                <h3>شارك الرابط</h3>
                <p>
                  حط لينكر في البايو أو واتساب ستوري. استقبل كل العتاب والمشاعر بخصوصية.
                </p>
              </div>

              <div className={styles.stepConnector}>
                <ArrowRight size={24} color="var(--primary)" />
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>٣</div>
                <div className={styles.stepIcon}><Handshake /></div>
                <h3>اتصالحوا بهدوء</h3>
                <p>
                  استخدم الـ AI لتحويل الزعل لرسائل كريمة، واتفقوا على المصالحة لو الطرفين جاهزين.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section className={`section ${styles.featuresSection}`}>
          <div className="container">
            <h2 className={styles.sectionTitle}>
              ليه المسامح كريم؟
            </h2>
            <div className={styles.featuresGrid}>
              {FEATURES.map((feature, i) => (
                <div key={i} className={`glass-card ${styles.featureCard}`}>
                  <div className={styles.featureIcon}>{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== AI DEMO ===== */}
        <section className={`section ${styles.demoSection}`}>
          <div className="container">
            <h2 className={styles.sectionTitle}>
              سحر الذكاء الاصطناعي
            </h2>
            <div className={styles.demoCard}>
              <div className={styles.demoRow}>
                <div className={styles.demoBefore}>
                  <div className={styles.demoLabel}>
                    <span>❌</span> الرسالة الأصلية
                  </div>
                  <div className={styles.demoBubble}>
                    &quot;إنت خلاص مش صاحبي وأنا زعلان منك أوي يا واد&quot;
                  </div>
                </div>
                <div className={styles.demoArrowCenter}>✨</div>
                <div className={styles.demoAfter}>
                  <div className={styles.demoLabel}>
                    <span>✅</span> بعد الـ AI
                  </div>
                  <div className={`${styles.demoBubble} ${styles.demoBubbleAi}`}>
                    &quot;يا صاحبي، أنا فعلاً زعلان من اللي حصل بينا. بس
                    صحبتنا أهم من أي خناقة. عايزك تعرف إن الموضوع لسه بيأثر
                    فيّا.&quot;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className={`section ${styles.testimonialsSection}`}>
          <div className="container">
            <h2 className={styles.sectionTitle}>
              قصص نجاح في الصلح
            </h2>
            <div className={styles.testimonialSlider}>
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className={`glass-card ${styles.testimonialCard} ${i === activeTestimonial ? styles.testimonialActive : ""}`}
                >
                  <p className={styles.testimonialText}>
                    &quot;{t.text}&quot;
                  </p>
                  <span className={styles.testimonialName}>— {t.name}</span>
                </div>
              ))}
            </div>
            <div className={styles.testimonialDots}>
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === activeTestimonial ? styles.dotActive : ""}`}
                  onClick={() => setActiveTestimonial(i)}
                  aria-label={`شهادة ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className={`section ${styles.ctaSection}`}>
          <div className="container-sm" style={{ textAlign: "center" }}>
            <h2 className={styles.ctaTitle}>
              وحشك حد؟
              <br />
              ابعتله رسالة دلوقتي
            </h2>
            <p className={styles.ctaText}>
              المسامح كريم مش مجرد تطبيق — هو أداة شجاعة هادية. بيخلي الواحد
              يقول اللي جوّاه من غير ما يخاف.
            </p>
            <button 
              className="btn btn-primary btn-lg"
              onClick={handleShareClick}
            >
              ابدأ دلوقتي — شارك صندوقك ✨
            </button>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className={styles.footer}>
          <div className="container">
            <div className={styles.footerInner}>
              <div className={styles.footerBrand}>
                <Handshake size={24} color="var(--primary)" /> <span>المسامح كريم</span>
              </div>
              <p className={styles.footerText}>
                صُنع بـ ❤️ في مصر — عشان الدنيا تبقى أحلى.
              </p>
              <div className={styles.footerLinks}>
                <a href="#">الخصوصية</a>
                <a href="#">الشروط</a>
                <a href="#">تواصل معانا</a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="شارك صندوقك 📬"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCopyLink}>
              انسخ اللينك 📋
            </button>
            <a
              href={baseUrl ? `https://wa.me/?text=${encodeURIComponent(`📬 عندي صندوق مسامحة — لو عندك كلام تقوله:\n${baseUrl}/u/${profile?.username}`)}` : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              واتساب 📲
            </a>
          </div>
        }
      >
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <div className={styles.sharePreview}>
            <div className={styles.shareBox}>
              <span style={{ fontSize: "2.5rem" }}>📬</span>
              <h4>صندوق المسامحة بتاعك</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                شاركه على واتساب أو انستاجرام — والناس تبعتلك مشاعرها.
              </p>
              <div
                className={styles.shareLink}
              >
                {`masameh.app/u/${profile?.username || 'your_username'}`}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
