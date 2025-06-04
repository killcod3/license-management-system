import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

export function generateUserHash(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function generateLicenseKey(): string {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    segments.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return segments.join('-');
}

export function isValidRecaptcha(
  recaptchaToken: string | null | undefined, 
  secretKey: string
): Promise<boolean> {
  if (!recaptchaToken) return Promise.resolve(false);

  const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
  const params = new URLSearchParams({
    secret: secretKey,
    response: recaptchaToken,
  });

  return fetch(`${verificationUrl}?${params.toString()}`, {
    method: 'POST',
  })
    .then((response) => response.json())
    .then((data) => {
      return data.success === true;
    })
    .catch(() => {
      return false;
    });
}