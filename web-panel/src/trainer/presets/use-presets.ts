import { useCallback, useEffect, useState } from 'react';

import type { TrainerMetaPayload } from '../../../protocol/messages';
import {
    capturePresetValues,
    createPreset,
    exportPresetsJson,
    importPresetsJson,
    loadPresets,
    type RemotePreset,
    savePresets,
} from './preset-storage';

type PresetsParams = {
    presetStorageKey: string;
    trainerMeta: TrainerMetaPayload | null;
    values: Record<string, unknown>;
    onError: (message: string) => void;
};

export function usePresets({ presetStorageKey, trainerMeta, values, onError }: PresetsParams) {
    const [presets, setPresets] = useState<RemotePreset[]>([]);

    useEffect(() => {
        setPresets(loadPresets(presetStorageKey));
    }, [presetStorageKey]);

    const addPreset = useCallback(
        (name: string): boolean => {
            if (!trainerMeta) {
                onError('No active trainer to save as a preset.');
                return false;
            }

            const captured = capturePresetValues(trainerMeta.schema.cheats, values);
            if (Object.keys(captured).length === 0) {
                onError('There are no mod values to save yet.');
                return false;
            }

            const next = [...presets, createPreset(name, captured)];
            if (!savePresets(presetStorageKey, next)) {
                onError(
                    'Could not save the preset in this browser. Check site storage permissions and available space.',
                );
                return false;
            }
            setPresets(next);
            return true;
        },
        [onError, presets, presetStorageKey, trainerMeta, values],
    );

    const deletePreset = useCallback(
        (presetId: string) => {
            const next = presets.filter((preset) => preset.id !== presetId);
            if (!savePresets(presetStorageKey, next)) {
                onError(
                    'Could not update presets in this browser. Check site storage permissions and available space.',
                );
                return;
            }
            setPresets(next);
        },
        [onError, presets, presetStorageKey],
    );

    const exportPresets = useCallback(() => {
        if (presets.length === 0) {
            onError('No presets to export yet.');
            return;
        }

        downloadJsonFile(exportPresetsJson(presetStorageKey), presetFileName(presetStorageKey));
    }, [onError, presetStorageKey, presets.length]);

    const importPresets = useCallback(
        async (file: File) => {
            let text: string;
            try {
                text = await file.text();
            } catch {
                onError('Could not read that file.');
                return;
            }

            const result = importPresetsJson(presetStorageKey, text);
            if (result.imported === 0) {
                onError('That file does not look like a Wand presets export.');
                return;
            }

            setPresets(result.presets);
            onError(
                result.skipped > 0
                    ? `Imported ${result.imported} preset(s), skipped ${result.skipped} that could not be read.`
                    : `Imported ${result.imported} preset(s).`,
            );
        },
        [onError, presetStorageKey],
    );

    return { presets, addPreset, deletePreset, exportPresets, importPresets };
}

function presetFileName(storageKey: string): string {
    const safeKey = storageKey.replace(/[^a-z0-9-]+/gi, '_');
    return `wand-presets-${safeKey}.json`;
}

function downloadJsonFile(json: string, fileName: string): void {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    try {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
    } finally {
        URL.revokeObjectURL(url);
    }
}
