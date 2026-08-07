import type {
  FAQItem,
  StatItem,
  FeaturePill,
  ServiceCard,
  StepItem,
  ProgrammeCard,
  PricingPlan,
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
  { label: "Schools", sectionId: "schools" },
  { label: "Programmes", sectionId: "programmes" },
  { label: "Pricing", sectionId: "pricing" },
];

export const HERO_STATS: StatItem[] = [
  { value: "500", suffix: "+", label: "Students Managed" },
  { value: "20", suffix: "+", label: "Active Schools" },
  { value: "3", suffix: "×", label: "Award Winner" },
];

export const FEATURE_PILLS: FeaturePill[] = [
  { icon: "📋", text: "Student records & report cards" },
  { icon: "🌐", text: "Branded public website included" },
  { icon: "💳", text: "Pay per term — not monthly" },
  { icon: "🏆", text: "Skill programmes & competitions" },
  { icon: "📱", text: "Works on any phone or laptop" },
  { icon: "🔒", text: "Your data. Always yours." },
];

export const PROBLEM_STATS = [
  {
    icon: "📉",
    value: "67%",
    description:
      "of Nigerian graduates are underemployed within 2 years of graduation",
  },
  {
    icon: "🧑‍💻",
    value: "3%",
    description:
      "of secondary school students have been exposed to coding or entrepreneurship",
  },
  {
    icon: "🏫",
    value: "200+",
    description:
      "EdTech platforms competing — none integrating software, devices, and programmes together",
  },
];

export const SERVICE_CARDS: ServiceCard[] = [
  {
    icon: "👤",
    title: "Student Management",
    description:
      "Register students, track attendance, manage class assignments and guardian information — all in one place.",
  },
  {
    icon: "📝",
    title: "Score Entry & Results",
    description:
      "Teachers enter CA and exam scores from their phones. Grades calculate automatically using the A1–F9 Nigerian scale.",
  },
  {
    icon: "📊",
    title: "Report Cards",
    description:
      "Branded, printable report cards generated automatically. Print one student or an entire class in seconds.",
  },
  {
    icon: "🌐",
    title: "Public School Website",
    description:
      "Every school gets a professional website at schoolname.nexaforges.me — with gallery, news, admissions, and contact form.",
  },
  {
    icon: "👩‍🏫",
    title: "Teacher Management",
    description:
      "Invite staff, assign them to classes and subjects, and control exactly what they can see and edit.",
  },
  {
    icon: "🏛️",
    title: "Academic Setup",
    description:
      "Configure sessions, terms, grading scales, and class structure to match exactly how your school is organised.",
  },
];

export const STEPS: StepItem[] = [
  {
    number: "01",
    title: "Contact Us",
    description:
      "Fill the short form below. Our team reaches out within 4 hours, creates your school account, and sends your admin the login details.",
  },
  {
    number: "02",
    title: "Set Up Your School",
    description:
      "Configure your session, classes, subjects, and staff in under 20 minutes using the guided setup checklist. No technical knowledge needed.",
  },
  {
    number: "03",
    title: "Go Live",
    description:
      "Your school management system is running. Your public website is live. Your teachers are entering scores. Your students are on track.",
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
    icon: "💡",
    gradient: "linear-gradient(135deg, #1a5c3a, #2d8b5a)",
    title: "Skill Development Sessions",
    description:
      "Coding, design, public speaking, financial literacy — delivered directly in partner schools.",
  },
  {
    icon: "🏆",
    gradient: "linear-gradient(135deg, #b8860b, #d4a017)",
    title: "Competitions",
    description:
      "Inter-school competitions in science, tech, entrepreneurship, and debate. Real prizes. Real recognition.",
  },
  {
    icon: "🎓",
    gradient: "linear-gradient(135deg, #1a4c6e, #2d7aaa)",
    title: "Scholarships",
    description:
      "Merit-based funding for outstanding students in partner schools. NexaForge-funded and sponsor-funded awards.",
  },
  {
    icon: "📱",
    gradient: "linear-gradient(135deg, #3a1a5c, #5a2d8b)",
    title: "Educational Devices",
    description:
      "Tablets and technology built for African classroom use — distributed through the NexaForge network.",
  },
  {
    icon: "🌍",
    gradient: "linear-gradient(135deg, #1a5c5c, #2d8b8b)",
    title: "Career Exposure",
    description:
      "Entrepreneurs, engineers, and leaders visit partner schools to show students what is possible.",
  },
  {
    icon: "🔗",
    gradient: "linear-gradient(135deg, #5c3a1a, #8b5a2d)",
    title: "The Network",
    description:
      "Every school in NexaForge can collaborate, share resources, and grow together as a community.",
  },
];

export const ECOSYSTEM_CARDS: ServiceCard[] = [
  {
    icon: "🖥️",
    borderColor: COLORS.primary,
    title: "NexaForge Platform",
    subLabel: "CORE PRODUCT",
    description:
      "School management software. Student data, results, report cards, public website, and billing — all in one.",
  },
  {
    icon: "📱",
    borderColor: "#1a4c6e",
    title: "NexaForge Devices",
    subLabel: "HARDWARE",
    description:
      "Tablets and classroom technology built specifically for African schools — distributed through the network.",
  },
  {
    icon: "🎯",
    borderColor: "#5c1a3a",
    title: "NexaForge Programmes",
    subLabel: "TRANSFORMATION",
    description:
      "Skills, competitions, scholarships, and career exposure. The thing that makes NexaForge schools different.",
  },
  {
    icon: "🏛️",
    borderColor: "#1a5c5c",
    title: "NexaForge Government",
    subLabel: "SCALE",
    description:
      "State government deployments. Bringing the NexaForge ecosystem to public schools across Nigeria.",
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Starter",
    price: "₦15,000",
    period: "per term · up to 200 students",
    features: [
      "200 students",
      "10 staff accounts",
      "School website included",
      "Score entry & report cards",
      "Email support",
    ],
    featured: false,
  },
  {
    name: "Growth",
    price: "₦30,000",
    period: "per term · up to 500 students",
    features: [
      "500 students",
      "30 staff accounts",
      "School website included",
      "Priority support",
      "NexaForge Programmes access",
    ],
    featured: true,
    badge: "Most Popular",
  },
  {
    name: "Premium",
    price: "₦60,000",
    period: "per term · unlimited",
    features: [
      "Unlimited students",
      "Unlimited staff",
      "Custom domain support",
      "Dedicated support line",
      "Full ecosystem access",
    ],
    featured: false,
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What exactly is NexaForge?",
    answer:
      "NexaForge is an education ecosystem — not just school management software. It gives every school a complete administrative platform, a branded public website, and direct access to skill development programmes, competitions, scholarships, and educational technology. It is the infrastructure for a new kind of African school.",
  },
  {
    question: "How is this different from Edves or Classnote?",
    answer:
      "Competitors automate your paperwork. NexaForge does that too — but that is only the door. Inside the door is a network: programmes that expose your students to entrepreneurship, technology, and the real world. Competitions. Scholarships. Devices. No other platform in Nigeria offers this as one connected system.",
  },
  {
    question: "How does the billing work — is it monthly?",
    answer:
      "No. NexaForge bills per term or per academic session — because Nigerian schools do not operate month to month. You pay for First Term, use it through to the last day, then decide whether to pay for Second Term. No charges during August or inter-term holidays. Ever.",
  },
  {
    question: "Does my school get a website?",
    answer:
      "Yes. Every school on NexaForge gets a fully branded public website at schoolname.nexaforges.me — with your logo, colours, contact details, gallery, news, and admissions page. It is live within minutes of setup. No web developer needed.",
  },
  {
    question: "What happens to our data if we stop using NexaForge?",
    answer:
      "Your data belongs to your school. You can export all student records, results, and information at any time, in standard formats. We do not hold your data hostage.",
  },
  {
    question: "How do we get started?",
    answer:
      'Click the "Get Your School on NexaForge" button and fill a short form. Our team contacts you within 24 hours. Setup takes less than one working day.',
  },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Platform",
    links: [
      "School Management",
      "Public Website",
      "Score & Results",
      "Report Cards",
      "Billing",
    ],
  },
  {
    heading: "Ecosystem",
    links: [
      "Skill Programmes",
      "Competitions",
      "Scholarships",
      "Educational Devices",
      "Government",
    ],
  },
  {
    heading: "Company",
    links: [
      "About NexaForge",
      "TheNexaVerse",
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
