import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';

/**
 * Help reaches a person (fix F-10): "Email us" and "Report a number" open a new email to the support address, with
 * the app's version and the phone's system filled in, so a tester's note arrives with what we need to look into it.
 * Nothing else about the person goes in: they write the rest themselves and can delete any of it before sending.
 *
 * The address comes from `EXPO_PUBLIC_SUPPORT_EMAIL`, set per build in `eas.json` once the domain exists (F-09).
 * Without one, Help says support isn't connected yet instead of pretending a message went.
 */
export function supportAddressFrom(value: string | undefined): string | null {
  const address = value?.trim() ?? '';
  return /^[^\s@<>?&#]+@[^\s@<>?&#]+\.[^\s@<>?&#.]+$/.test(address) ? address : null;
}
export const supportAddress = supportAddressFrom(process.env.EXPO_PUBLIC_SUPPORT_EMAIL);

export type SupportKind = 'question' | 'number';
export type SupportResult = 'opened' | 'not-set' | 'no-mail-app';

const subjects: Record<SupportKind, string> = { question: 'A question about Life', number: 'A number in Life looks wrong' };
const openers: Record<SupportKind, string> = {
  question: 'Hello,\n\n',
  number: 'Hello,\n\nThis number looks wrong:\n\nWhere I saw it:\n\nWhat I expected:\n\n',
};

/** The line added under the message: the app's version and the phone's system, nothing about the person. */
export function supportFooter(): string {
  const version = `${Constants.expoConfig?.version ?? '1.0'}${Constants.nativeBuildVersion ? ` (${Constants.nativeBuildVersion})` : ''}`;
  // The system's name and version (iOS 18.2, Android 15), never the phone's name, which often carries the owner's.
  const system = Device.osName && Device.osVersion ? `${Device.osName} ${Device.osVersion}` : 'the web preview';
  return `\n\nSent from Life ${version} on ${system}`;
}

/** The `mailto:` link for a kind of message, or null without an address. */
export function supportLink(kind: SupportKind, address = supportAddress): string | null {
  if (!address) return null;
  const body = `${openers[kind]}${supportFooter()}`;
  return `mailto:${address}?subject=${encodeURIComponent(subjects[kind])}&body=${encodeURIComponent(body)}`;
}

/** Opens the phone's mail app with the message started. */
export async function openSupport(kind: SupportKind, address = supportAddress): Promise<SupportResult> {
  const link = supportLink(kind, address);
  if (!link) return 'not-set';
  try { await Linking.openURL(link); return 'opened'; } catch { return 'no-mail-app'; }
}
