export async function sendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/auth/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Send verification email error:', error);
    return { success: false, error: 'Hiba az email küldésekor' };
  }
}

export async function sendInsuranceDocument(
  insuranceId: number,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/insurance/send-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ insuranceId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Send insurance document error:', error);
    return { success: false, error: 'Hiba az email küldésekor' };
  }
}
