/* eslint-disable @typescript-eslint/no-explicit-any */
import { newFlatSchema } from "./StepConfig";
import type { FlatData } from "../../../../types/NewFlatsFormType";

export default async function validateField<K extends keyof FlatData>(
  key: K,
  value: FlatData[K]
): Promise<{ success: boolean; error?: string }> {
  try {
    await newFlatSchema.validateAt(key, { [key]: value });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
