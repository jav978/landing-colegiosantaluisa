import { supabase } from './db';

export interface PreRegistrationConfig {
  enabled: boolean;
  type: 'always' | 'schedule' | 'manual';
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  days_of_week: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time: string; // HH:MM
  end_time: string; // HH:MM
}

export const DEFAULT_CONFIG: PreRegistrationConfig = {
  enabled: true,
  type: 'always',
  start_date: '',
  end_date: '',
  days_of_week: [1, 2, 3, 4, 5], // Monday to Friday
  start_time: '07:00',
  end_time: '19:00',
};

/**
 * Gets the current system configuration from database or returns the default
 */
export async function getPreRegistrationConfig(): Promise<PreRegistrationConfig> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'pre_registration_config')
      .single();

    if (error || !data) {
      return DEFAULT_CONFIG;
    }

    return { ...DEFAULT_CONFIG, ...(data.value as Partial<PreRegistrationConfig>) };
  } catch (err) {
    console.error('Error fetching system settings:', err);
    return DEFAULT_CONFIG;
  }
}

/**
 * Checks if pre-registrations are currently active based on the config parameters
 */
export async function isPreRegistrationActive(): Promise<boolean> {
  const config = await getPreRegistrationConfig();

  if (!config.enabled) {
    return false;
  }

  if (config.type === 'always') {
    return true;
  }

  if (config.type === 'manual') {
    const nowInVenezuela = new Date().toLocaleString('en-US', { timeZone: 'America/Caracas' });
    const localDate = new Date(nowInVenezuela);

    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const currentDateStr = `${year}-${month}-${day}`;

    if (config.start_date && currentDateStr < config.start_date) {
      return false;
    }
    if (config.end_date && currentDateStr > config.end_date) {
      return false;
    }
    return true;
  }

  if (config.type === 'schedule') {
    // Determine Venezuela (Caracas) local time to verify scheduling restrictions
    const nowInVenezuela = new Date().toLocaleString('en-US', { timeZone: 'America/Caracas' });
    const localDate = new Date(nowInVenezuela);

    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const currentDateStr = `${year}-${month}-${day}`;

    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    const dayOfWeek = localDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // 1. Date range validations
    if (config.start_date && currentDateStr < config.start_date) {
      return false;
    }
    if (config.end_date && currentDateStr > config.end_date) {
      return false;
    }

    // 2. Day of the week validations
    if (config.days_of_week && config.days_of_week.length > 0) {
      if (!config.days_of_week.includes(dayOfWeek)) {
        return false;
      }
    }

    // 3. Time range validations
    if (config.start_time && currentTimeStr < config.start_time) {
      return false;
    }
    if (config.end_time && currentTimeStr > config.end_time) {
      return false;
    }

    return true;
  }

  return false;
}
