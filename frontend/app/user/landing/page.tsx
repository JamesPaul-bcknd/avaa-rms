"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Web Development": (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3CD894"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  "Mobile Apps": (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3CD894"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  "UI/UX Design": (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3CD894"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  ),
  "Data Science": (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3CD894"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  "Cloud & DevOps": (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3CD894"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
    </svg>
  ),
  Cybersecurity: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3CD894"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  "AI & Machine Learning": (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3CD894"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1.27c.34-.6.99-1 1.73-1a2 2 0 110 4c-.74 0-1.39-.4-1.73-1H20a7 7 0 01-7 7v1.27c.6.34 1 .99 1 1.73a2 2 0 11-4 0c0-.74.4-1.39 1-1.73V20a7 7 0 01-7-7H2.73c-.34.6-.99 1-1.73 1a2 2 0 110-4c.74 0 1.39.4 1.73 1H4a7 7 0 017-7V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z" />
    </svg>
  ),
  Marketing: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3CD894"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
};

const CATEGORIES = [
  { label: "Web Development", count: 312 },
  { label: "Mobile Apps", count: 185 },
  { label: "UI/UX Design", count: 247 },
  { label: "Data Science", count: 156 },
  { label: "Cloud & DevOps", count: 198 },
  { label: "Cybersecurity", count: 134 },
  { label: "AI & Machine Learning", count: 223 },
  { label: "Marketing", count: 167 },
];

const FEATURED_JOBS = [
  {
    id: 1,
    initials: "TN",
    color: "#1e3a4f",
    title: "Senior Frontend Developer",
    company: "TechNova",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120k–$160k",
  },
  {
    id: 2,
    initials: "DS",
    color: "#3CD894",
    title: "Backend Engineer",
    company: "DataStream",
    location: "New York, NY",
    type: "Full-time",
    salary: "$130k–$170k",
  },
  {
    id: 3,
    initials: "FL",
    color: "#6366f1",
    title: "Full-Stack Developer",
    company: "FlowLabs",
    location: "Seattle, WA",
    type: "Full-time",
    salary: "$125k–$165k",
  },
  {
    id: 4,
    initials: "NL",
    color: "#0ea5e9",
    title: "Data Scientist",
    company: "NeuraLabs",
    location: "Boston, MA",
    type: "Full-time",
    salary: "$135k–$175k",
  },
  {
    id: 5,
    initials: "PH",
    color: "#1e3a4f",
    title: "Product Manager",
    company: "PivotHub",
    location: "Remote",
    type: "Full-time",
    salary: "$115k–$155k",
  },
  {
    id: 6,
    initials: "SF",
    color: "#2a5a6e",
    title: "Solutions Architect",
    company: "StackForge",
    location: "Denver, CO",
    type: "Full-time",
    salary: "$150k–$200k",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    text: "AVAA helped me find my dream job in just two weeks. The platform is intuitive and the job recommendations are spot on.",
  },
  {
    name: "Marcus Rivera",
    role: "Product Designer",
    text: "I love how easy it is to browse and apply. The multi-step application wizard made the process seamless and stress-free.",
  },
  {
    name: "Aisha Patel",
    role: "Data Analyst",
    text: "The best job platform I have used. Clean interface, quality listings, and I appreciate the company transparency.",
  },
];

const PARTNER_LOGOS = ["Google", "Microsoft", "Amazon", "Meta", "Apple"];

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [heroVisible, setHeroVisible] = useState(false);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "AVAA – Find Your Ideal Job";
  }, []);
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Scroll-triggered section animations
  useEffect(() => {
    const container = sectionsRef.current;
    if (!container) return;
    const sections = container.querySelectorAll(".section-enter");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/user/dashboard`;
    }
  };

  return (
    <div
      ref={sectionsRef}
      className="min-h-screen bg-white overflow-x-hidden page-enter"
    >
      {/* ═══════════════════════════════════
                NAVBAR
               ═══════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e5e7eb]">
        <div className="max-w-[1370px] mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
          <Link href="/user/landing" className="flex items-center gap-2.5">
            <Image src="/avaa_logo.png" alt="AVAA" width={32} height={32} />
            <span className="text-xl font-bold text-[#1e3a4f] tracking-wide">
              AVAA
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5a6a75]">
            <a
              href="#how-it-works"
              className="hover:text-[#1e3a4f] transition-colors"
            >
              How It Works
            </a>
            <a
              href="#categories"
              className="hover:text-[#1e3a4f] transition-colors"
            >
              Categories
            </a>
            <a href="#jobs" className="hover:text-[#1e3a4f] transition-colors">
              Jobs
            </a>
            <a
              href="#testimonials"
              className="hover:text-[#1e3a4f] transition-colors"
            >
              Reviews
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-[#1e3a4f] hover:bg-[#f0f2f5] rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 hover:shadow-lg"
              style={{ background: "#3CD894" }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════
                HERO SECTION
               ═══════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-[#f0fdf7] via-white to-[#ecfdf5] overflow-hidden">
        {/* Decorative dots */}
        <div
          className="absolute top-0 right-0 w-72 h-72 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, #3CD894 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #1e3a4f 1.5px, transparent 1.5px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="max-w-[1370px] mx-auto px-6 lg:px-10 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            {/* Left */}
            <div
              className={`transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e6faf0] text-[#2bb87a] text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-[#3CD894] animate-pulse" />
                #1 Job Recruitment Platform
              </div>
              <h1 className="text-4xl md:text-[52px] font-extrabold text-[#1e3a4f] leading-[1.12] mb-5">
                Find Your
                <br />
                <span className="text-[#3CD894]">Ideal Job</span>
              </h1>
              <p className="text-base md:text-lg text-[#5a6a75] mb-8 max-w-md leading-relaxed">
                Explore thousands of job opportunities from top companies. Your
                next career move starts here.
              </p>

              {/* Search Bar */}
              <form
                onSubmit={handleSearch}
                className="flex items-center bg-white rounded-2xl shadow-lg shadow-[#3CD894]/10 border border-[#e5e7eb] p-2 mb-8 max-w-lg"
              >
                <div className="flex items-center gap-2 flex-1 px-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search job titles, companies..."
                    className="flex-1 py-2 text-sm text-[#1a1a1a] placeholder-[#9ca3af] bg-transparent focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "#3CD894" }}
                >
                  Search
                </button>
              </form>

              {/* Stats */}
              <div className="flex items-center gap-6 md:gap-10">
                <div>
                  <p className="text-2xl font-extrabold text-[#1e3a4f]">8M+</p>
                  <p className="text-xs text-[#5a6a75]">Active Members</p>
                </div>
                <div className="w-px h-10 bg-[#e5e7eb]" />
                <div>
                  <p className="text-2xl font-extrabold text-[#1e3a4f]">15k+</p>
                  <p className="text-xs text-[#5a6a75]">Jobs Posted</p>
                </div>
                <div className="w-px h-10 bg-[#e5e7eb]" />
                <div>
                  <p className="text-2xl font-extrabold text-[#1e3a4f]">2k+</p>
                  <p className="text-xs text-[#5a6a75]">Companies</p>
                </div>
              </div>
            </div>

            {/* Right — Hero Visual */}
            <div
              className={`relative hidden md:flex justify-center transition-all duration-700 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <div className="relative w-full max-w-[435px]">
                {/* Main card */}
                <div className="bg-white rounded-3xl shadow-2xl shadow-[#1e3a4f]/10 p-8 border border-[#e5e7eb]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1e3a4f] to-[#2a5a6e] flex items-center justify-center text-white font-bold text-sm">
                      TN
                    </div>
                    <div>
                      <p className="font-bold text-[#1a1a1a] text-sm">
                        Senior Frontend Developer
                      </p>
                      <p className="text-xs text-[#5a6a75]">
                        TechNova · San Francisco
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#e6faf0] text-[#3CD894]">
                      React
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#eef2ff] text-[#6366f1]">
                      TypeScript
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#fef3e2] text-[#d97706]">
                      Tailwind CSS
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-extrabold text-[#1e3a4f]">
                      $120k–$160k
                    </span>
                    <span
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-white"
                      style={{ background: "#3CD894" }}
                    >
                      Apply Now
                    </span>
                  </div>
                </div>

                {/* Floating badge — Unlocking your potential */}
                <div className="absolute -top-4 -left-6 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 border border-[#e5e7eb] animate-[float_3s_ease-in-out_infinite]">
                  <div className="w-10 h-10 rounded-full bg-[#e6faf0] flex items-center justify-center">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#3CD894"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1a1a1a]">
                      Unlocking your
                    </p>
                    <p className="text-xs font-bold text-[#3CD894]">
                      potential
                    </p>
                  </div>
                </div>

                {/* Floating badge — Candidates hired */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 border border-[#e5e7eb] animate-[float_3s_ease-in-out_infinite_0.5s]">
                  <div className="w-10 h-10 rounded-full bg-[#fef3e2] flex items-center justify-center">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87" />
                      <path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1a1a1a]">
                      10k+ candidates
                    </p>
                    <p className="text-[11px] text-[#5a6a75]">
                      hired this month
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
                PARTNER LOGOS
               ═══════════════════════════════════ */}
      <section className="border-y border-[#e5e7eb] bg-[#fafbfc] overflow-hidden">
        <div
          className="relative py-6"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div className="flex gap-16 animate-[marquee_12s_linear_infinite] hover:[animation-play-state:paused] w-max">
            {[
              ...PARTNER_LOGOS,
              ...PARTNER_LOGOS,
              ...PARTNER_LOGOS,
              ...PARTNER_LOGOS,
            ].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="text-lg md:text-xl font-bold text-[#c4ccd4] tracking-wider select-none whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
                HOW IT WORKS
               ═══════════════════════════════════ */}
      <section id="how-it-works" className="py-20 bg-white section-enter">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#e6faf0] text-[#3CD894] text-xs font-semibold mb-4">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1e3a4f]">
              It&apos;s Easy to Get Started
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-40">
            {[
              {
                step: "01",
                icon: (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3CD894"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                ),
                title: "Create Account",
                desc: "Sign up for free and build your professional profile in minutes.",
              },
              {
                step: "02",
                icon: (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3CD894"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                ),
                title: "Browse Jobs",
                desc: "Search and filter through thousands of quality job listings.",
              },
              {
                step: "03",
                icon: (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3CD894"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ),
                title: "Apply & Get Hired",
                desc: "Submit applications with our streamlined wizard and land your dream role.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-white rounded-2xl border border-[#e5e7eb] p-8 text-center group "
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#3CD894] text-white text-xs font-bold flex items-center justify-center">
                  {item.step}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[#e6faf0] flex items-center justify-center mx-auto mb-5 mt-2 ">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#5a6a75] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
                TOP COMPANIES
               ═══════════════════════════════════ */}
      <section className="py-20 bg-[#f5f7fa] section-enter">
        <div className="max-w-[1370px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#e6faf0] text-[#3CD894] text-xs font-semibold mb-4">
              TOP COMPANIES
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1e3a4f] mb-3">
              Many Top Companies
              <br />
              Posted Here
            </h2>
            <p className="text-sm text-[#5a6a75] max-w-lg mx-auto">
              Leading organizations trust AVAA to find the best talent across
              industries.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              "TechNova",
              "DataStream",
              "FlowLabs",
              "NeuraLabs",
              "CloudScale",
              "AppAxis",
              "StackForge",
              "ByteFortress",
            ].map((name) => {
              const initial = name.slice(0, 2).toUpperCase();
              return (
                <div
                  key={name}
                  className="bg-white rounded-2xl border border-[#e5e7eb] p-6 flex items-center gap-4 "
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3a4f] to-[#3CD894] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {initial}
                  </div>
                  <div>
                    <p className="font-bold text-[#1a1a1a] text-sm ">
                      {name}
                    </p>
                    <p className="text-xs text-[#9ca3af]">Hiring now</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
                BROWSE BY CATEGORIES
               ═══════════════════════════════════ */}
      <section id="categories" className="py-20 bg-white section-enter">
        <div className="max-w-[1370px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#e6faf0] text-[#3CD894] text-xs font-semibold mb-4">
              CATEGORIES
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1e3a4f]">
              Browse by Categories
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.label}
                className="bg-white rounded-2xl border border-[#e5e7eb] p-6 text-center hover:shadow-lg hover:border-[#3CD894]/30 transition-all duration-300 cursor-pointer group hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#e6faf0] flex items-center justify-center mx-auto mb-3 group-hover:bg-[#d0f5e6] transition-colors">
                  {CATEGORY_ICONS[cat.label]}
                </div>
                <h3 className="text-sm font-bold text-[#1a1a1a] mb-1 group-hover:text-[#3CD894] transition-colors">
                  {cat.label}
                </h3>
                <p className="text-xs text-[#9ca3af]">{cat.count} jobs</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
                AI RECRUITER CTA
               ═══════════════════════════════════ */}
      <section
        className="relative overflow-hidden section-enter"
        style={{
          background: "linear-gradient(135deg, #1e3a4f 0%, #2a5a6e 100%)",
        }}
      >
        {/* Decorative pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #3CD894 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="max-w-[1370px] mx-auto px-6 lg:px-10 py-16 md:py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/15 text-[#3CD894] text-xs font-semibold mb-5">
                SMART MATCHING
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
                Meet with AVAA&apos;s
                <br />
                Smart Recruiter
              </h2>
              <p className="text-sm text-white/70 mb-8 max-w-md leading-relaxed">
                Our intelligent matching system analyzes your skills and
                preferences to connect you with the perfect opportunities —
                automatically.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-[#1e3a4f] bg-[#3CD894] hover:bg-[#2bb87a] transition-colors"
              >
                Get Started Free
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 max-w-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#3CD894] flex items-center justify-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2a10 10 0 0110 10 10 10 0 01-10 10A10 10 0 012 12 10 10 0 0112 2z" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">
                      AVAA Assistant
                    </p>
                    <p className="text-xs text-white/60">Online</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/10 rounded-2xl rounded-tl-none px-4 py-3">
                    <p className="text-sm text-white/90">
                      Hi! I found{" "}
                      <span className="font-bold text-[#3CD894]">12 jobs</span>{" "}
                      matching your profile. Shall I show you the top picks?
                    </p>
                  </div>
                  <div className="bg-[#3CD894]/20 rounded-2xl rounded-tr-none px-4 py-3 ml-8">
                    <p className="text-sm text-white/90">
                      Yes, show me the best matches!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
                JOB OF THE DAY
               ═══════════════════════════════════ */}
      <section id="jobs" className="py-20 bg-[#f5f7fa] section-enter">
        <div className="max-w-[1370px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#e6faf0] text-[#3CD894] text-xs font-semibold mb-4">
              FEATURED LISTINGS
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1e3a4f] mb-3">
              Check Job of The Day
            </h2>
            <p className="text-sm text-[#5a6a75] max-w-lg mx-auto">
              Hand-picked opportunities updated daily to help you discover the
              best roles.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {FEATURED_JOBS.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-[#e5e7eb] p-6 hover:shadow-xl hover:border-[#3CD894]/30 transition-all duration-300 group cursor-pointer hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: job.color }}
                  >
                    {job.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#1a1a1a] text-sm group-hover:text-[#3CD894] transition-colors truncate">
                      {job.title}
                    </h3>
                    <p className="text-xs text-[#5a6a75]">{job.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4 text-xs text-[#5a6a75]">
                  <span className="flex items-center gap-1">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {job.location}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#e6faf0] text-[#3CD894] font-medium">
                    {job.type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-[#1e3a4f]">
                    {job.salary}
                  </span>
                  <Link
                    href="/user/dashboard"
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-[#3CD894] border border-[#3CD894] hover:bg-[#3CD894] hover:text-white transition-all"
                  >
                    Apply
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/user/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
              style={{ background: "#3CD894" }}
            >
              View All Jobs
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
                TESTIMONIALS
               ═══════════════════════════════════ */}
      <section id="testimonials" className="py-20 bg-white section-enter">
        <div className="max-w-[1370px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#e6faf0] text-[#3CD894] text-xs font-semibold mb-4">
              TESTIMONIALS
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1e3a4f] mb-3">
              Quotes from Our Users
            </h2>
            <p className="text-sm text-[#5a6a75] max-w-lg mx-auto">
              Hear what professionals say about their AVAA experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl border border-[#e5e7eb] p-8 hover:shadow-lg transition-all duration-300 relative"
              >
                {/* Quote icon */}
                <div className="w-10 h-10 rounded-full bg-[#e6faf0] flex items-center justify-center mb-5">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="#3CD894"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609L9.978 5.151C7.546 6.068 5.983 8.789 5.983 11h4v10H0z" />
                  </svg>
                </div>
                <p className="text-sm text-[#5a6a75] leading-relaxed mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1e3a4f] to-[#3CD894] flex items-center justify-center text-white font-bold text-xs">
                    {t.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a1a1a]">{t.name}</p>
                    <p className="text-xs text-[#9ca3af]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
                CTA SECTION
               ═══════════════════════════════════ */}
      <section
        className="relative overflow-hidden section-enter"
        style={{
          background: "linear-gradient(135deg, #3CD894 0%, #2bb87a 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="max-w-[1370px] mx-auto px-6 lg:px-10 py-16 md:py-20 relative z-10 text-center">
          <p className="text-sm font-semibold text-white/80 mb-3">
            Ready to Get Your Dream Job?
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-8">
            Register Here Now <span className="inline-block ml-2">→</span>
          </h2>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold bg-white text-[#1e3a4f] hover:shadow-2xl hover:-translate-y-0.5 transition-all"
          >
            Get Started for Free
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════
                FOOTER
               ═══════════════════════════════════ */}
      <footer className="bg-[#1e3a4f] text-white/70">
        <div className="max-w-[1370px] mx-auto px-6 lg:px-10 py-14">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Image src="/avaa_logo.png" alt="AVAA" width={28} height={28} />
                <span className="text-lg font-bold text-white tracking-wide">
                  AVAA
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                Your next career move starts here. Browse jobs, grow your
                network, and land your dream role.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-[#3CD894] transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#categories"
                    className="hover:text-[#3CD894] transition-colors"
                  >
                    Categories
                  </a>
                </li>
                <li>
                  <a
                    href="#jobs"
                    className="hover:text-[#3CD894] transition-colors"
                  >
                    Featured Jobs
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    className="hover:text-[#3CD894] transition-colors"
                  >
                    Testimonials
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <span className="text-white/40 cursor-default">
                    Help Center
                  </span>
                </li>
                <li>
                  <span className="text-white/40 cursor-default">
                    Privacy Policy
                  </span>
                </li>
                <li>
                  <span className="text-white/40 cursor-default">
                    Terms of Service
                  </span>
                </li>
                <li>
                  <span className="text-white/40 cursor-default">
                    Contact Us
                  </span>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">
                Stay Updated
              </h4>
              <p className="text-sm mb-4">
                Get the latest jobs delivered to your inbox.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#3CD894] focus:border-transparent"
                />
                <button className="px-4 py-2.5 rounded-lg text-sm font-semibold text-[#1e3a4f] bg-[#3CD894] hover:bg-[#2bb87a] transition-colors">
                  →
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <p>© 2026 AVAA. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="cursor-default">Privacy</span>
              <span className="cursor-default">Terms</span>
              <span className="cursor-default">Cookies</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════
                GLOBAL KEYFRAMES
               ═══════════════════════════════════ */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
