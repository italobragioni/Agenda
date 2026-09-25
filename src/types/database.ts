/**
 * Tipos do banco de dados (mantidos em sincronia com supabase/migrations).
 *
 * Mantemos escrito à mão para simplicidade. Se no futuro o schema crescer
 * muito, podemos gerar automaticamente com a CLI do Supabase.
 */

export type AppointmentStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export type BookingSource = "admin" | "public";

export type Plan = "trial" | "basic" | "premium";

export interface Business {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  whatsapp: string | null;
  logo_url: string | null;
  address: string | null;
  timezone: string;
  appointment_interval_minutes: number;
  onboarding_completed: boolean;
  plan: Plan;
  trial_ends_at: string | null;
  paid_until: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  business_id: string;
  full_name: string;
  role: "owner";
  created_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  business_id: string;
  customer_id: string | null;
  service_id: string | null;
  customer_name_snapshot: string;
  customer_phone_snapshot: string;
  service_name_snapshot: string;
  price_cents: number;
  duration_minutes: number;
  start_at: string;
  end_at: string;
  status: AppointmentStatus;
  booking_source: BookingSource;
  notes: string | null;
  idempotency_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  id: string;
  business_id: string;
  weekday: number; // 0 = domingo ... 6 = sábado
  is_open: boolean;
  start_time: string | null; // "HH:MM:SS"
  end_time: string | null;
}

export interface BlockedTime {
  id: string;
  business_id: string;
  start_at: string;
  end_at: string;
  reason: string | null;
  created_at: string;
}
