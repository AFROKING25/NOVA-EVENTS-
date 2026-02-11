import { supabase } from '../supabase';
import type { Database } from '../database.types';

type Event = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];
type EventUpdate = Database['public']['Tables']['events']['Update'];
type EventLocation = Database['public']['Tables']['event_locations']['Row'];
type ContributionOption = Database['public']['Tables']['contribution_options']['Row'];
type CustomTemplate = Database['public']['Tables']['custom_templates']['Row'];

export interface EventWithRelations extends Event {
  locations?: EventLocation[];
  contribution_options?: ContributionOption[];
  custom_templates?: CustomTemplate[];
}

export class EventService {
  static async createEvent(organizerId: string, eventData: {
    name: string;
    type: string;
    eventDate: string;
    description?: string;
    locations?: { label: string; url: string }[];
    contributionOptions?: { name: string; amount: number }[];
  }): Promise<EventWithRelations> {
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        organizer_id: organizerId,
        name: eventData.name,
        type: eventData.type,
        event_date: eventData.eventDate,
        description: eventData.description,
        status: 'draft'
      })
      .select()
      .single();

    if (eventError) throw eventError;

    if (eventData.locations && eventData.locations.length > 0) {
      const locationsToInsert = eventData.locations.map((loc, idx) => ({
        event_id: event.id,
        label: loc.label,
        google_maps_url: loc.url,
        display_order: idx
      }));

      const { error: locError } = await supabase
        .from('event_locations')
        .insert(locationsToInsert);

      if (locError) throw locError;
    }

    if (eventData.contributionOptions && eventData.contributionOptions.length > 0) {
      const optionsToInsert = eventData.contributionOptions.map((opt, idx) => ({
        event_id: event.id,
        name: opt.name,
        amount: opt.amount,
        display_order: idx
      }));

      const { error: optError } = await supabase
        .from('contribution_options')
        .insert(optionsToInsert);

      if (optError) throw optError;
    } else {
      const defaultOptions = [
        { event_id: event.id, name: 'Standard', amount: 20000, display_order: 0 },
        { event_id: event.id, name: 'VIP', amount: 50000, display_order: 1 }
      ];

      await supabase.from('contribution_options').insert(defaultOptions);
    }

    return this.getEventById(event.id);
  }

  static async getEventById(eventId: string): Promise<EventWithRelations> {
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        locations:event_locations(*),
        contribution_options(*),
        custom_templates(*)
      `)
      .eq('id', eventId)
      .single();

    if (eventError) throw eventError;
    return event as any;
  }

  static async getUserEvents(userId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', userId)
      .order('event_date', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async updateEvent(eventId: string, updates: EventUpdate): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateCardDesign(eventId: string, design: {
    backgroundUrl?: string;
    namePosition?: { x: number; y: number; w: number; h: number };
    qrPosition?: { x: number; y: number; w: number; h: number };
  }): Promise<Event> {
    const updates: EventUpdate = {};

    if (design.backgroundUrl) {
      updates.card_background_url = design.backgroundUrl;
    }

    if (design.namePosition) {
      updates.card_name_position = design.namePosition as any;
    }

    if (design.qrPosition) {
      updates.card_qr_position = design.qrPosition as any;
    }

    return this.updateEvent(eventId, updates);
  }

  static async updatePaymentDetails(eventId: string, paymentDetails: {
    mobile?: { number: string; name: string };
    bank?: { accountNo: string; bankName: string; name: string };
    lipa?: { number: string; name: string };
  }): Promise<Event> {
    const updates: EventUpdate = {
      payment_mobile: paymentDetails.mobile as any,
      payment_bank: paymentDetails.bank as any,
      payment_lipa: paymentDetails.lipa as any
    };

    return this.updateEvent(eventId, updates);
  }

  static async deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  }

  static async updateEventStatus(eventId: string, status: 'draft' | 'live' | 'completed' | 'cancelled'): Promise<Event> {
    return this.updateEvent(eventId, { status });
  }

  static async addEventLocation(eventId: string, label: string, googleMapsUrl: string): Promise<EventLocation> {
    const { data, error } = await supabase
      .from('event_locations')
      .insert({
        event_id: eventId,
        label,
        google_maps_url: googleMapsUrl
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getEventLocations(eventId: string): Promise<EventLocation[]> {
    const { data, error } = await supabase
      .from('event_locations')
      .select('*')
      .eq('event_id', eventId)
      .order('display_order');

    if (error) throw error;
    return data;
  }

  static async upsertCustomTemplate(eventId: string, templateType: 'invitation' | 'reminder' | 'thank_you', subject: string, body: string): Promise<CustomTemplate> {
    const { data, error } = await supabase
      .from('custom_templates')
      .upsert({
        event_id: eventId,
        template_type: templateType,
        subject,
        body
      }, {
        onConflict: 'event_id,template_type'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
