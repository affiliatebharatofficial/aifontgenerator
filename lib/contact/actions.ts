'use server';

import { createClient } from '@/lib/supabase/server';

export interface ContactActionResult {
  success: boolean;
  message: string;
}

export async function submitContactAction(
  prevState: ContactActionResult | null,
  formData: FormData
): Promise<ContactActionResult> {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const subject = String(formData.get('subject') || '').trim();
  const message = String(formData.get('message') || '').trim();

  if (!name || !email || !subject || !message) {
    return {
      success: false,
      message: 'All fields (name, email, subject, message) are required.',
    };
  }

  if (!email.includes('@') || !email.includes('.')) {
    return {
      success: false,
      message: 'Please provide a valid email address.',
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('contact_messages').insert({
      name,
      email,
      subject,
      message,
      status: 'unread',
    });

    if (error) {
      console.error('Contact submission database error:', error);
      return {
        success: false,
        message: 'Failed to record your message in our database. Please try again.',
      };
    }

    return {
      success: true,
      message: 'Your inquiry has been successfully transmitted. Our engineering support team will review your message.',
    };
  } catch (err) {
    console.error('Contact action error:', err);
    return {
      success: false,
      message: 'An unexpected server error occurred while sending your message.',
    };
  }
}
