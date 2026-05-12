import { Haptics, ImpactStyle } from "@capacitor/haptics";

export async function impactLight(): Promise<void> {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // No-op on web / non-Capacitor environments
  }
}
