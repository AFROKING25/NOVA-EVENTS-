import { supabase } from '../supabase';
import type { Database } from '../database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export class ProfileService {
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updatePaymentDefaults(userId: string, paymentDefaults: {
    mobile?: { number: string; name: string };
    bank?: { accountNo: string; bankName: string; name: string };
    lipa?: { number: string; name: string };
  }): Promise<Profile> {
    const updates: ProfileUpdate = {};

    if (paymentDefaults.mobile) {
      updates.default_mobile_number = paymentDefaults.mobile.number;
      updates.default_mobile_name = paymentDefaults.mobile.name;
    }

    if (paymentDefaults.bank) {
      updates.default_bank_account = paymentDefaults.bank.accountNo;
      updates.default_bank_name = paymentDefaults.bank.bankName;
      updates.default_bank_holder = paymentDefaults.bank.name;
    }

    if (paymentDefaults.lipa) {
      updates.default_lipa_number = paymentDefaults.lipa.number;
      updates.default_lipa_name = paymentDefaults.lipa.name;
    }

    return this.updateProfile(userId, updates);
  }

  static async getPaymentDefaults(userId: string) {
    const profile = await this.getProfile(userId);
    if (!profile) return null;

    return {
      mobile: profile.default_mobile_number && profile.default_mobile_name
        ? { number: profile.default_mobile_number, name: profile.default_mobile_name }
        : undefined,
      bank: profile.default_bank_account && profile.default_bank_name
        ? {
            accountNo: profile.default_bank_account,
            bankName: profile.default_bank_name,
            name: profile.default_bank_holder || ''
          }
        : undefined,
      lipa: profile.default_lipa_number && profile.default_lipa_name
        ? { number: profile.default_lipa_number, name: profile.default_lipa_name }
        : undefined
    };
  }
}
