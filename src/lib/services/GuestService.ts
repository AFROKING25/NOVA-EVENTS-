import { supabase } from '../supabase';
import type { Database } from '../database.types';

type Guest = Database['public']['Tables']['guests']['Row'];
type GuestInsert = Database['public']['Tables']['guests']['Insert'];
type GuestUpdate = Database['public']['Tables']['guests']['Update'];

export interface BulkGuestData {
  name: string;
  phone: string;
  email?: string;
  pledgeAmount?: number;
  category?: string;
}

export class GuestService {
  static async createGuest(guestData: GuestInsert): Promise<Guest> {
    const { data, error } = await supabase
      .from('guests')
      .insert(guestData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async bulkCreateGuests(eventId: string, guests: BulkGuestData[]): Promise<Guest[]> {
    const guestsToInsert = guests.map(guest => ({
      event_id: eventId,
      name: guest.name,
      phone: guest.phone,
      email: guest.email,
      pledge_amount: guest.pledgeAmount || 20000,
      category: guest.category || 'Regular',
      payment_status: 'not_started' as const
    }));

    const { data, error } = await supabase
      .from('guests')
      .insert(guestsToInsert)
      .select();

    if (error) throw error;
    return data;
  }

  static async getEventGuests(eventId: string): Promise<Guest[]> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getGuestById(guestId: string): Promise<Guest | null> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('id', guestId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async getGuestBySecureToken(secureToken: string): Promise<Guest | null> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('secure_token', secureToken)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async updateGuest(guestId: string, updates: GuestUpdate): Promise<Guest> {
    const { data, error } = await supabase
      .from('guests')
      .update(updates)
      .eq('id', guestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updatePaymentStatus(
    guestId: string,
    status: 'not_started' | 'pledged' | 'payment_pending' | 'paid',
    transactionId?: string
  ): Promise<Guest> {
    const updates: GuestUpdate = {
      payment_status: status
    };

    if (status === 'paid') {
      updates.paid_at = new Date().toISOString();
    }

    if (transactionId) {
      updates.transaction_id = transactionId;
    }

    return this.updateGuest(guestId, updates);
  }

  static async updateRSVPStatus(
    guestId: string,
    status: 'pending' | 'confirmed' | 'declined'
  ): Promise<Guest> {
    return this.updateGuest(guestId, { rsvp_status: status });
  }

  static async checkInGuest(guestId: string): Promise<Guest> {
    return this.updateGuest(guestId, {
      checked_in: true,
      checked_in_at: new Date().toISOString()
    });
  }

  static async deleteGuest(guestId: string): Promise<void> {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', guestId);

    if (error) throw error;
  }

  static async searchGuests(eventId: string, query: string): Promise<Guest[]> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`);

    if (error) throw error;
    return data;
  }

  static async getGuestsByPaymentStatus(
    eventId: string,
    status: 'not_started' | 'pledged' | 'payment_pending' | 'paid'
  ): Promise<Guest[]> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .eq('payment_status', status);

    if (error) throw error;
    return data;
  }

  static async getGuestStats(eventId: string) {
    const { data: guests, error } = await supabase
      .from('guests')
      .select('payment_status, pledge_amount, rsvp_status, checked_in')
      .eq('event_id', eventId);

    if (error) throw error;

    const stats = {
      total: guests.length,
      paid: guests.filter(g => g.payment_status === 'paid').length,
      pledged: guests.filter(g => g.payment_status === 'pledged').length,
      notPaid: guests.filter(g => g.payment_status === 'not_started' || g.payment_status === 'payment_pending').length,
      confirmed: guests.filter(g => g.rsvp_status === 'confirmed').length,
      declined: guests.filter(g => g.rsvp_status === 'declined').length,
      pending: guests.filter(g => g.rsvp_status === 'pending').length,
      checkedIn: guests.filter(g => g.checked_in).length,
      totalPledged: guests.reduce((sum, g) => sum + (g.pledge_amount || 0), 0),
      totalPaid: guests.filter(g => g.payment_status === 'paid').reduce((sum, g) => sum + (g.pledge_amount || 0), 0)
    };

    return stats;
  }

  static async markInviteSent(guestId: string): Promise<Guest> {
    return this.updateGuest(guestId, {
      invite_sent: true,
      invite_sent_at: new Date().toISOString()
    });
  }

  static async markReminderSent(guestId: string): Promise<Guest> {
    return this.updateGuest(guestId, {
      reminder_sent_at: new Date().toISOString()
    });
  }

  static async markThankYouSent(guestId: string): Promise<Guest> {
    return this.updateGuest(guestId, {
      thank_you_sent_at: new Date().toISOString()
    });
  }
}
