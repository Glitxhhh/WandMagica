import { type CheatSchema, ECheatType, type TrainerSummary } from '../../../protocol/messages';
import { getTrainerStorageId, loadJson, saveJson } from '../../shared/storage';

export type RemotePreset = {
    id: string;
    name: string;
    values: Record<string, unknown>;
    createdAt: string;
};

const STORAGE_KEY_PREFIX = 'wand-remote.presets.v1:';
const PRESET_COMPATIBLE_TYPES = new Set<ECheatType>([
    ECheatType.Toggle,
    ECheatType.Slider,
    ECheatType.Number,
    ECheatType.Selection,
    ECheatType.Scalar,
    ECheatType.Incremental,
]);

export function getPresetStorageKey(trainer: TrainerSummary | null): string {
    return `${STORAGE_KEY_PREFIX}${getTrainerStorageId(trainer) ?? 'global'}`;
}

export function loadPresets(storageKey: string): RemotePreset[] {
    return loadJson<RemotePreset[]>(
        storageKey,
        (raw) =>
            Array.isArray(raw)
                ? raw
                      .map(normalizePreset)
                      .filter((preset): preset is RemotePreset => Boolean(preset))
                : null,
        [],
    );
}

export function savePresets(storageKey: string, presets: RemotePreset[]): boolean {
    return saveJson(storageKey, presets, (value) => Array.isArray(value) && value.length === 0);
}

export function exportPresetsJson(storageKey: string): string {
    return JSON.stringify(loadPresets(storageKey), null, 2);
}

export type ImportPresetsResult = {
    /** Entries that parsed as a valid preset and were added. */
    imported: number;
    /** Entries that didn't look like a preset (wrong shape, no name) and were dropped. */
    skipped: number;
    presets: RemotePreset[];
};

/**
 * Merges presets from a previously exported JSON array into storage. An imported preset whose
 * id collides with an existing one gets a fresh id rather than being silently dropped - presets
 * exported from two different devices can otherwise share an id with unrelated content.
 */
export function importPresetsJson(storageKey: string, jsonString: string): ImportPresetsResult {
    const existing = loadPresets(storageKey);

    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonString);
    } catch {
        return { imported: 0, skipped: 0, presets: existing };
    }

    if (!Array.isArray(parsed)) {
        return { imported: 0, skipped: 0, presets: existing };
    }

    const existingIds = new Set(existing.map((preset) => preset.id));
    const merged = [...existing];
    let imported = 0;
    let skipped = 0;

    for (const entry of parsed) {
        const preset = normalizePreset(entry);
        if (!preset) {
            skipped++;
            continue;
        }

        const resolved = existingIds.has(preset.id) ? { ...preset, id: createPresetId() } : preset;
        existingIds.add(resolved.id);
        merged.push(resolved);
        imported++;
    }

    if (imported > 0) {
        savePresets(storageKey, merged);
    }

    return { imported, skipped, presets: merged };
}

export function createPreset(name: string, values: Record<string, unknown>): RemotePreset {
    return {
        id: createPresetId(),
        name: name.trim(),
        values,
        createdAt: new Date().toISOString(),
    };
}

export function capturePresetValues(
    cheats: CheatSchema[],
    currentValues: Record<string, unknown>,
): Record<string, unknown> {
    const values: Record<string, unknown> = {};
    for (const cheat of cheats) {
        if (!PRESET_COMPATIBLE_TYPES.has(cheat.type)) {
            continue;
        }

        if (!(cheat.target in currentValues)) {
            continue;
        }

        values[cheat.target] = currentValues[cheat.target];
    }

    return values;
}

function normalizePreset(value: unknown): RemotePreset | null {
    if (!isRecord(value) || !isRecord(value.values)) {
        return null;
    }

    const id = typeof value.id === 'string' && value.id.trim() ? value.id.trim() : createPresetId();
    const name = typeof value.name === 'string' && value.name.trim() ? value.name.trim() : null;
    if (!name) {
        return null;
    }

    return {
        id,
        name,
        values: value.values,
        createdAt: typeof value.createdAt === 'string' ? value.createdAt : new Date().toISOString(),
    };
}

function createPresetId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `preset_${Date.now().toString(36)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}
