import { CountryOption } from '../types';

export const COUNTRIES: CountryOption[] = [
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia', dialCode: '+91', safetyIndex: 82 },
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'Americas', dialCode: '+1', safetyIndex: 88 },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe', dialCode: '+44', safetyIndex: 92 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'Americas', dialCode: '+1', safetyIndex: 95 },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Oceania', dialCode: '+61', safetyIndex: 94 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe', dialCode: '+49', safetyIndex: 93 },
  { code: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe', dialCode: '+33', safetyIndex: 89 },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia', dialCode: '+81', safetyIndex: 98 },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'Asia', dialCode: '+65', safetyIndex: 97 },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', region: 'Middle East', dialCode: '+971', safetyIndex: 94 },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'Americas', dialCode: '+55', safetyIndex: 75 },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', region: 'Africa', dialCode: '+27', safetyIndex: 72 },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', region: 'Europe', dialCode: '+34', safetyIndex: 91 },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', region: 'Europe', dialCode: '+39', safetyIndex: 90 },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', region: 'Americas', dialCode: '+52', safetyIndex: 76 },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', region: 'Europe', dialCode: '+31', safetyIndex: 94 },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', region: 'Asia', dialCode: '+82', safetyIndex: 96 },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', region: 'Asia', dialCode: '+66', safetyIndex: 84 },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', region: 'Africa', dialCode: '+20', safetyIndex: 78 },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', region: 'Americas', dialCode: '+54', safetyIndex: 80 },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', region: 'Asia', dialCode: '+84', safetyIndex: 86 },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', region: 'Asia', dialCode: '+62', safetyIndex: 83 },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', region: 'Europe', dialCode: '+41', safetyIndex: 97 },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', region: 'Oceania', dialCode: '+64', safetyIndex: 96 },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', region: 'Europe', dialCode: '+46', safetyIndex: 93 },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East', dialCode: '+966', safetyIndex: 88 },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', region: 'Europe', dialCode: '+47', safetyIndex: 96 },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', region: 'Asia', dialCode: '+60', safetyIndex: 87 },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', region: 'Asia', dialCode: '+63', safetyIndex: 79 },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', region: 'Europe', dialCode: '+30', safetyIndex: 88 }
];

export const DEFAULT_GUEST_COUNTRY = 'India';

export function getCountryByName(name: string): CountryOption | undefined {
  return COUNTRIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}
