import { supabase } from '@/lib/supabase';

const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'me.com',
  'mail.com',
  'protonmail.com',
  'zoho.com'
];

export type ExistingUserResult = {
  exists: boolean;
  type?: 'rep' | 'brand';
  identifier?: string;
};

export const isEmail = (input: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
};

export const isPhoneNumber = (input: string) => {
  const cleanPhone = input.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

export const formatPhoneNumber = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};

export const isMaryadhaEmail = (email: string) => {
  return email.toLowerCase().endsWith('@maryadha.com');
};

export const isPersonalEmail = (email: string) => {
  const domain = email.toLowerCase().split('@')[1];
  return PERSONAL_EMAIL_DOMAINS.includes(domain);
};

export const checkExistingUser = async (identifier: string): Promise<ExistingUserResult> => {
  try {
    if (isEmail(identifier)) {
      if (isMaryadhaEmail(identifier)) {
        const { data: existingRep } = await supabase
          .from('reps')
          .select('email')
          .eq('email', identifier)
          .single();
        if (existingRep) {
          return { exists: true, type: 'rep', identifier: existingRep.email };
        }
      }
      const { data: existingBrand } = await supabase
        .from('brands')
        .select('email')
        .eq('email', identifier)
        .single();
      if (existingBrand) {
        return { exists: true, type: 'brand', identifier: existingBrand.email };
      }
    } else if (isPhoneNumber(identifier)) {
      const formattedPhone = formatPhoneNumber(identifier);
      const { data: existingBrand } = await supabase
        .from('brands')
        .select('phone')
        .eq('phone', formattedPhone)
        .single();
      if (existingBrand) {
        return { exists: true, type: 'brand', identifier: existingBrand.phone };
      }
    }
    return { exists: false };
  } catch (error) {
    if (error instanceof Error && !error.message.includes('not found')) {
      throw error;
    }
    return { exists: false };
  }
};

/**
 * Get the current user's rep_id from the reps table
 * @returns The rep_id (UUID) if the current user is a rep, null otherwise
 */
export const getCurrentUserRepId = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: rep, error } = await supabase
      .from('reps')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (error || !rep) return null;
    return rep.id;
  } catch (error) {
    console.error('Error getting current user rep_id:', error);
    return null;
  }
}; 