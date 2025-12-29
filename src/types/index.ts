import type { StaticImageData } from "next/image";

export interface LeaderProfile {
  name: string;
  title: string;
  photo: string | StaticImageData;
}

export interface LeaderCategory {
  id: string;
  title: string;
  leaders: LeaderProfile[];
}

export interface DocumentSubcategory {
  id: string;
  label: string;
  code: string;
}

export interface DocumentCategory {
  id: string;
  label: string;
  subcategories: DocumentSubcategory[];
}

export interface QrRequestRecord {
  id: string;
  woreda_id: string;
  code: string;
  ip_address?: string;
  status: "pending" | "approved" | "denied";
  created_at: string;
  temporary_access_token?: string;
}

export interface TemporaryAccessRecord {
  id: string;
  request_id: string;
  woreda_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface DocumentUploadRecord {
  id: string;
  woreda_id: string;
  category_id: string;
  subcategory_code: string;
  year: string;
  file_name: string;
  storage_url: string;
  uploader_id: string;
  created_at: string;
}

export interface AppointmentRecord {
  id: string;
  woreda_id: string;
  unique_code: string;
  requester_name: string;
  requester_email?: string;
  requester_phone?: string;
  reason: string;
  requested_date_ethiopian: string;
  requested_date_gregorian?: string;
  requested_time?: string;
  status: "pending" | "accepted" | "rejected" | "rescheduled";
  admin_reason?: string;
  rescheduled_date_ethiopian?: string;
  rescheduled_date_gregorian?: string;
  rescheduled_time?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsRecord {
  id: string;
  woreda_id: string;
  title: string;
  content: string;
  summary?: string;
  cover_image_url?: string;
  youtube_url?: string;
  published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaderRecord {
  id: string;
  woreda_id: string;
  name: string;
  title: string;
  speech?: string;
  name_am?: string;
  title_am?: string;
  speech_am?: string;
  name_or?: string;
  title_or?: string;
  speech_or?: string;
  category: 'principal' | 'commission-committee' | 'management' | 'work-leadership' | 'monitoring-committees';
  sort_order: number;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}



