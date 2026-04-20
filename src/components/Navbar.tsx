"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Modal from "./Modal";
import { useAuth } from "@/context/AuthContext";
import { 
  Handshake, 
  Inbox, 
  User, 
  LogOut, 
  LogIn, 
  Key,
  ChevronDown,
  Settings
} from "lucide-react";

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            <Handshake size={24} color="var(--primary)" /> <span>المسامح كريم</span>
          </Link>
          <div className="navbar-actions">
            {loading ? (
              <div className="spinner" style={{ width: 24, height: 24 }} />
            ) : user ? (
              <>
                {/* Desktop View: Linear Buttons */}
                <div className="hide-mobile" style={{ gap: 'var(--space-md)' }}>
                  <Link href="/inbox" className="btn btn-ghost" style={{ gap: '8px' }}>
                    <Inbox size={18} /> صندوقي
                  </Link>
                  {profile && (
                    <Link href={`/u/${profile.username}`} className="btn btn-ghost" style={{ gap: '8px' }}>
                      <div className="avatar avatar-xs" style={{ width: 22, height: 22, overflow: 'hidden', background: 'var(--primary-glow)', color: 'var(--primary)', border: 'none' }}>
                        {profile.photoURL ? (
                          <img src={profile.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User size={14} />
                        )}
                      </div>
                      بروفايلي
                    </Link>
                  )}
                  <button className="btn btn-secondary btn-sm" onClick={signOut} style={{ gap: '8px' }}>
                    <LogOut size={16} /> خروج
                  </button>
                </div>

                {/* Mobile View: Dropdown */}
                <div className="hide-desktop">
                  <div className="dropdown-container" ref={dropdownRef}>
                    <button 
                      className={`btn btn-ghost ${showDropdown ? 'active' : ''}`} 
                      onClick={() => setShowDropdown(!showDropdown)}
                      style={{ gap: '8px', padding: '8px 12px' }}
                    >
                      <div className="avatar avatar-sm" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '0.8rem', overflow: 'hidden' }}>
                        {profile?.photoURL ? (
                          <img src={profile.photoURL} alt={profile.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <ChevronDown size={14} style={{ opacity: 0.5, transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>

                    <div className={`dropdown-menu ${showDropdown ? 'dropdown-active' : ''} dropdown-menu-right`}>
                      {profile && (
                        <Link href={`/u/${profile.username}`} className="dropdown-item" onClick={() => setShowDropdown(false)}>
                          <User size={18} /> بروفايلي
                        </Link>
                      )}
                      <Link href="/inbox" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                        <Inbox size={18} /> صندوقي
                      </Link>
                      <div className="dropdown-divider" />
                      <button 
                        className="dropdown-item dropdown-item-danger" 
                        onClick={() => {
                          signOut();
                          setShowDropdown(false);
                        }}
                      >
                        <LogOut size={18} /> خروج
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowLogin(true)}
                style={{ gap: '8px' }}
              >
                <LogIn size={18} /> دخول / تسجيل
              </button>
            )}
          </div>
        </div>
      </nav>

      <Modal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        title="ادخل حسابك"
        footer={
          <button
            className="btn btn-primary btn-block"
            onClick={async () => {
              await signInWithGoogle();
              setShowLogin(false);
            }}
          >
            دخول بجوجل
          </button>
        }
      >
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div
            className="avatar avatar-xl"
            style={{ margin: "0 auto var(--space-lg)", background: 'var(--primary-glow)', color: 'var(--primary)' }}
          >
            <Key size={48} />
          </div>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
            سجّل دخولك عشان تعمل صندوق المسامحة بتاعك
            <br />
            وتبدأ تستقبل رسائل من الناس.
          </p>
        </div>
      </Modal>
    </>
  );
}
