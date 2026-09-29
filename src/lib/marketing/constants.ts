import type {
  FAQItem,
  StatItem,
  ServiceCard,
  StepItem,
  ProgrammeCard,
  FooterColumn,
  NavLink,
} from "@/types/marketing";

export const COLORS = {
  primary: "#1a5c3a",
  primaryDark: "#0d3320",
  primaryDeep: "#071a10",
  gold: "#c9991a",
  goldLight: "rgba(201,153,26,0.15)",
  white: "#ffffff",
  cream: "#f8f6f1",
  text: "#1c1c1c",
  textMid: "#4a4a4a",
  textLight: "#888888",
} as const;

export const NAV_LINKS: NavLink[] = [
  { label: "Platform", sectionId: "platform" },
  { label: "In Development", sectionId: "coming-soon" },
  { label: "Vision", sectionId: "vision" },
  { label: "Pricing", sectionId: "pricing" },
];

export const HERO_STATS: StatItem[] = [
  { value: "500", suffix: "+", label: "Students Managed" },
  { value: "20", suffix: "+", label: "Active Schools" },
  { value: "1", suffix: "", label: "Purpose" },
];

/**
 * Hero feature pills — text only, no emoji. Rendered as a compact list
 * inside the hero's right-hand card.
 */
export const FEATURE_PILLS = [
  { text: "Student & teacher records" },
  { text: "Branded public website" },
  { text: "Pay per term or per session" },
  { text: "Scores, results & report cards" },
  { text: "Works on any phone or laptop" },
  { text: "Your data. Always yours." },
];

export const PROBLEM_STATS = [
  {
    icon: "TrendingDown",
    value: "67%",
    description:
      "of Nigerian graduates are underemployed within 2 years of graduation",
  },
  {
    icon: "Code2",
    value: "3%",
    description:
      "of secondary school students have been exposed to coding or entrepreneurship",
  },
  {
    icon: "School",
    value: "200+",
    description:
      "EdTech platforms competing — most automating paperwork, not producing better outcomes",
  },
];

// ============================================================================
// SERVICE_CARDS — What we do today. Icon strings map to lucide-react
// components via the shared ICON_MAP in PlatformSection.
// ============================================================================
export const SERVICE_CARDS: ServiceCard[] = [
  {
    icon: "Users",
    title: "Student & Teacher Records",
    description:
      "Register students and staff digitally. Manage class assignments, guardian information, enrollment history, and profile data — all in one place.",
  },
  {
    icon: "Landmark",
    title: "Classes, Subjects & Academic Setup",
    description:
      "Configure academic sessions, terms, classes, subjects, and grading structures to match exactly how your school is organised.",
  },
  {
    icon: "ClipboardPen",
    title: "Score Entry & Result Processing",
    description:
      "Teachers enter CA and examination scores from any device. Grades calculate automatically using your school's grading scale.",
  },
  {
    icon: "BarChart3",
    title: "Report Cards & Results",
    description:
      "Branded, printable report cards generated automatically. Print one student or an entire class in seconds.",
  },
  {
    icon: "GraduationCap",
    title: "Promotion & New-Term Preparation",
    description:
      "Move students into their next academic stage and prepare the next term without rebuilding records from scratch.",
  },
  {
    icon: "Globe",
    title: "Public School Website",
    description:
      "A branded public website at schoolname.nexaforges.me — with your identity, contact details, gallery, and admissions information.",
  },
];

export const COMING_SOON_ITEMS = [
  {
    icon: "Camera",
    title: "AI-Assisted Exam Preparation",
    description:
      "Photograph or upload exam questions. We extract the content, structure it, and prepare it for printing. Extracted content always remains subject to staff review before use.",
    note: "Cutting exam preparation cost from hours of typing to a few minutes.",
  },
  {
    icon: "CalendarCheck",
    title: "Attendance Tracking",
    description:
      "Daily attendance tied to each student's record, generating attendance reports alongside academic results.",
    note: "Currently in design — not yet available in the platform.",
  },
  {
    icon: "MessageCircle",
    title: "Parent Communication",
    description:
      "Direct messaging between the school and parents for announcements, results, and updates.",
    note: "Planned for a future release.",
  },
];

export const STEPS: StepItem[] = [
  {
    number: "01",
    title: "Talk to Us",
    description:
      "We learn how your school currently operates — records, workflows, and the pain points that consume the most time.",
  },
  {
    number: "02",
    title: "Set Up Your School",
    description:
      "We configure the platform around your sessions, classes, subjects, staff, and students. No technical knowledge required on your end.",
  },
  {
    number: "03",
    title: "Train Your Staff",
    description:
      "Administrators and teachers are introduced to the system through practical, hands-on training on their own school data.",
  },
  {
    number: "04",
    title: "Go Live & Grow",
    description:
      "Your school runs on NexaForge. Your public website is live. Your teachers are entering scores. You can expand at your own pace.",
  },
];

export const BAND_STATS: StatItem[] = [
  { value: "500", suffix: "+", label: "Students Managed" },
  { value: "20", suffix: "+", label: "Schools Active" },
  { value: "₦0", suffix: "", label: "August Charges" },
  { value: "98", suffix: "%", label: "Setup Success Rate" },
];

export const PROGRAMME_CARDS: ProgrammeCard[] = [
  {
    icon: "Lightbulb",
    gradient: "linear-gradient(135deg, #1a5c3a, #2d8b5a)",
    title: "Skill Development Sessions",
    description:
      "Coding, design, public speaking, financial literacy — intended to be delivered directly in partner schools.",
  },
  {
    icon: "Trophy",
    gradient: "linear-gradient(135deg, #b8860b, #d4a017)",
    title: "Competitions",
    description:
      "Inter-school competitions in science, technology, entrepreneurship, and debate — with real prizes and recognition.",
  },
  {
    icon: "GraduationCap",
    gradient: "linear-gradient(135deg, #1a4c6e, #2d7aaa)",
    title: "Scholarships",
    description:
      "Merit-based funding for outstanding students in partner schools — funded through NexaForge and sponsors.",
  },
  {
    icon: "Tablet",
    gradient: "linear-gradient(135deg, #3a1a5c, #5a2d8b)",
    title: "Educational Devices",
    description:
      "Tablets and classroom technology built for African schools — distributed through the NexaForge network.",
  },
  {
    icon: "Globe2",
    gradient: "linear-gradient(135deg, #1a5c5c, #2d8b8b)",
    title: "Career Exposure",
    description:
      "Entrepreneurs, engineers, and leaders visiting partner schools to show students what is possible.",
  },
  {
    icon: "Network",
    gradient: "linear-gradient(135deg, #5c3a1a, #8b5a2d)",
    title: "The Network",
    description:
      "A community of NexaForge schools collaborating, sharing resources, and growing together.",
  },
];

export const ECOSYSTEM_CARDS: ServiceCard[] = [
  {
    icon: "Monitor",
    borderColor: COLORS.primary,
    title: "NexaForge Platform",
    subLabel: "AVAILABLE NOW",
    description:
      "School management software. Student data, results, report cards, public website, and billing — all in one.",
  },
  {
    icon: "Target",
    borderColor: "#5c1a3a",
    title: "NexaForge Programmes",
    subLabel: "IN DEVELOPMENT",
    description:
      "Skills development, competitions, scholarships, and career exposure — designed to make NexaForge schools educationally different.",
  },
  {
    icon: "TabletSmartphone",
    borderColor: "#1a4c6e",
    title: "NexaForge Devices",
    subLabel: "FUTURE DIRECTION",
    description:
      "Tablets and classroom technology built specifically for African schools — distributed through the NexaForge network.",
  },
  {
    icon: "Landmark",
    borderColor: "#1a5c5c",
    title: "NexaForge Government",
    subLabel: "FUTURE DIRECTION",
    description:
      "State government partnerships bringing the NexaForge platform to public schools across Nigeria.",
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What exactly is NexaForge?",
    answer:
      "NexaForge is a Nigerian education technology initiative. We give schools practical digital tools that reduce repetitive work — organizing records, processing results, generating reports, and giving the school a credible digital presence. We do this one workflow at a time, in partnership with each school.",
  },
  {
    question: "What does NexaForge do today — and what is still in development?",
    answer:
      "Available now: student and teacher records, class and subject setup, score entry, automatic grade calculation, report cards, promotion and term preparation, and a public school website. In development: AI-assisted exam preparation, attendance tracking, and parent communication. We are transparent about what is live and what is coming, and we do not promise features before they exist.",
  },
  {
    question: "How does the billing work — is it monthly?",
    answer:
      "No. NexaForge bills per term or per academic session — because Nigerian schools do not operate month to month. You can pay term by term, or pay for the full session upfront and save about 11%. No charges during August or inter-term holidays.",
  },
  {
    question: "Does my school get a website?",
    answer:
      "Yes. Every school on NexaForge gets a branded public website at schoolname.nexaforges.me — with your logo, colours, contact details, gallery, and admissions information. It is live within minutes of setup.",
  },
  {
    question: "What happens to our data if we stop using NexaForge?",
    answer:
      "Your data belongs to your school. You can export all student records, results, and information at any time, in standard formats. We do not hold your data hostage.",
  },
  {
    question: "How do we get started?",
    answer:
      'Click "Talk to Us" and fill in a short form. Our team reaches out within 24 hours to understand your school\'s workflow, then we discuss the appropriate setup and plan.',
  },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Platform",
    links: [
      "Student Records",
      "Score Entry & Results",
      "Report Cards",
      "Promotion & Terms",
      "Public Website",
    ],
  },
  {
    heading: "In Development",
    links: [
      "AI Exam Preparation",
      "Attendance Tracking",
      "Parent Communication",
      "Digital Training",
    ],
  },
  {
    heading: "Company",
    links: [
      "About NexaForge",
      "Our Vision",
      "Privacy Policy",
      "Terms of Service",
      "Contact Us",
    ],
  },
];

export const TRUST_BADGES = [
  "14-day free trial",
  "No setup fees",
  "No August charges",
  "Cancel anytime",
];

export const PHILOSOPHY_STEPS = [
  {
    number: "01",
    title: "Organize",
    description:
      "We start by understanding how your school runs today — where records live, where time is lost, and where things break down. Then we put your records in order.",
  },
  {
    number: "02",
    title: "Automate",
    description:
      "Once your data is organized, we automate the repetitive work: score calculations, grade assignment, result compilation, report generation.",
  },
  {
    number: "03",
    title: "Enable",
    description:
      "With the paperwork reduced, your teachers and administrators get their time back. That is what we are actually building.",
  },
];
