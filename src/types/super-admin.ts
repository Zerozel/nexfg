export interface SuperAdminStats {
  total_schools: number;
  active_schools: number;
  trial_schools: number;
  inactive_schools: number;
  total_students: number;
  total_teachers: number;
  total_classes: number;
  total_subjects: number;
}

export interface SuperAdminSchool {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  domain: string | null;
  admin_name: string;
  admin_email: string;
  subscription_status: 'trial' | 'active' | 'inactive' | 'expired';
  subscription_tier: 'free' | 'trial' | 'basic' | 'pro';
  student_count: number;
  teacher_count: number;
  class_count: number;
  created_at: string;
}

export interface SuperAdminSchoolDetail {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  domain: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  motto: string | null;
  subscription_status: 'trial' | 'active' | 'inactive' | 'expired';
  subscription_tier: 'free' | 'trial' | 'basic' | 'pro';
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
  admin: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  } | null;
  stats: {
    students: number;
    teachers: number;
    classes: number;
    subjects: number;
    assessments: number;
  };
}

export interface CreateSchoolPayload {
  name: string;
  admin_full_name: string;
  admin_email: string;
  admin_password?: string;
  phone?: string;
  subscription_tier: 'free' | 'trial' | 'basic' | 'pro';
}

export interface CreateSchoolResponse {
  success: boolean;
  school: {
    id: string;
    name: string;
    subdomain: string;
    slug: string;
  };
  admin: {
    id: string;
    full_name: string;
    email: string;
    temporary_password: string;
  };
  login_url: string;
}
