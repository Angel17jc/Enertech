export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  preferred_language: 'es' | 'en';
  theme: 'light' | 'dark';
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  user_id: string;
  name: string;
  device_type: DeviceType;
  watts: number;
  hours_per_day: number;
  is_active: boolean;
  created_at: string;
}

export type DeviceType =
  | 'refrigerator'
  | 'air_conditioner'
  | 'washing_machine'
  | 'dryer'
  | 'dishwasher'
  | 'television'
  | 'computer'
  | 'water_heater'
  | 'lighting'
  | 'oven'
  | 'microwave'
  | 'other';

export interface ConsumptionRecord {
  id: string;
  user_id: string;
  date: string;
  kwh_consumed: number;
  cost: number;
  notes?: string;
  created_at: string;
}

export interface EnergyGoal {
  id: string;
  user_id: string;
  target_kwh: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'failed';
  created_at: string;
}

export interface Recommendation {
  id: string;
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
  category: 'heating' | 'cooling' | 'lighting' | 'appliances' | 'general';
  potential_savings_percent: number;
  is_active: boolean;
  created_at: string;
}

export interface UserRecommendation {
  id: string;
  user_id: string;
  recommendation_id: string;
  status: 'pending' | 'applied' | 'dismissed';
  created_at: string;
  recommendation?: Recommendation;
}

export interface ElectricityRate {
  id: string;
  rate_name: string;
  cost_per_kwh: number;
  currency: string;
  is_default: boolean;
  valid_from: string;
  created_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  is_first_visit: boolean;
  found_needed: boolean;
  visit_reason?: string;
  not_found_info?: string;
  ease_of_use: 'veryEasy' | 'easy' | 'neutral' | 'difficult' | 'veryDifficult';
  device_usage: '1-2' | '3-5' | '6-10' | '10+';
  energy_savings_experience: 'excellent' | 'good' | 'fair' | 'poor' | 'veryPoor';
  recommendations?: string;
  general_comments?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
}
