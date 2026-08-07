export interface FAQItem {
  question: string;
  answer: string;
}

export interface StatItem {
  value: string;
  suffix: string;
  label: string;
}

export interface FeaturePill {
  icon: string;
  text: string;
}

export interface ServiceCard {
  icon: string;
  title: string;
  description: string;
  borderColor?: string;
  subLabel?: string;
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
}

export interface ProgrammeCard {
  icon: string;
  gradient: string;
  title: string;
  description: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  featured: boolean;
  badge?: string;
}

export interface FooterColumn {
  heading: string;
  links: string[];
}

export interface NavLink {
  label: string;
  sectionId: string;
}
