import { z } from "zod";

const optionalNumber = z.number().nullish();
const optionalString = z.string().nullish();

export const machinePhaseSchema = z.object({
  state: z.string(),
  substate: z.string(),
});

export const machineSnapshotSchema = z.object({
  timestamp: z.string(),
  state: machinePhaseSchema,
  flow: z.number(),
  pressure: z.number(),
  targetFlow: z.number(),
  targetPressure: z.number(),
  mixTemperature: z.number(),
  groupTemperature: z.number(),
  targetMixTemperature: z.number(),
  targetGroupTemperature: z.number(),
  profileFrame: z.number(),
  steamTemperature: z.number(),
});

export const deviceSummarySchema = z.object({
  name: z.string(),
  id: z.string(),
  state: z.string(),
  type: z.string(),
});

export const workflowProfileSchema = z.object({
  version: optionalString,
  title: optionalString,
  notes: optionalString,
  author: optionalString,
  beverage_type: optionalString,
  target_weight: optionalNumber,
  target_volume: optionalNumber,
  target_volume_count_start: optionalNumber,
  tank_temperature: optionalNumber,
  steps: z.array(z.record(z.string(), z.unknown())).optional(),
}).passthrough();

export const workflowContextSchema = z.object({
  targetDoseWeight: optionalNumber,
  targetYield: optionalNumber,
  grinderModel: optionalString,
  grinderSetting: optionalString,
  coffeeName: optionalString,
  coffeeRoaster: optionalString,
  finalBeverageType: optionalString,
});

export const workflowSettingsSchema = z.object({
  targetTemperature: optionalNumber,
  duration: optionalNumber,
  flow: optionalNumber,
  volume: optionalNumber,
});

export const workflowRecordSchema = z.object({
  id: z.string().nullish(),
  name: optionalString,
  description: optionalString,
  profile: workflowProfileSchema.optional(),
  context: workflowContextSchema.optional(),
  steamSettings: workflowSettingsSchema.optional(),
  hotWaterData: workflowSettingsSchema.optional(),
  rinseData: workflowSettingsSchema.optional(),
});

export const profileRecordSchema = z.object({
  id: z.string(),
  profile: workflowProfileSchema,
  metadataHash: z.string().nullish(),
  compoundHash: z.string().nullish(),
  parentId: z.string().nullish(),
  visibility: z.enum(["visible", "hidden", "deleted"]).nullish(),
  isDefault: z.boolean().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
  metadata: z.record(z.string(), z.unknown()).nullish(),
});

export const shotRecordSchema = z
  .object({
    id: z.string().nullish(),
    timestamp: z.string().nullish(),
    workflow: z
      .object({
        name: z.string().nullish(),
      })
      .optional(),
    context: workflowContextSchema.optional(),
    weight: z.number().optional(),
    volume: z.number().optional(),
  })
  .catchall(z.unknown());

export const machineStateChangeSchema = z.enum([
  "idle",
  "sleeping",
  "espresso",
  "steam",
  "hotWater",
  "flush",
]);

export const deviceSummaryListSchema = z.array(deviceSummarySchema);
export const profileRecordListSchema = z.array(profileRecordSchema);
export const shotRecordListSchema = z.array(shotRecordSchema);

export type MachinePhase = z.infer<typeof machinePhaseSchema>;
export type MachineSnapshot = z.infer<typeof machineSnapshotSchema>;
export type DeviceSummary = z.infer<typeof deviceSummarySchema>;
export type WorkflowProfile = z.infer<typeof workflowProfileSchema>;
export type WorkflowContext = z.infer<typeof workflowContextSchema>;
export type WorkflowSettings = z.infer<typeof workflowSettingsSchema>;
export type WorkflowRecord = z.infer<typeof workflowRecordSchema>;
export type ProfileRecord = z.infer<typeof profileRecordSchema>;
export type ShotRecord = z.infer<typeof shotRecordSchema>;
export type MachineStateChange = z.infer<typeof machineStateChangeSchema>;
