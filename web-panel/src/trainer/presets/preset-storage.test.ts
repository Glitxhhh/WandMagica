import { beforeEach, describe, expect, it } from 'vitest';

import { type CheatSchema, ECheatType } from '../../../protocol/messages';
import {
    capturePresetValues,
    exportPresetsJson,
    importPresetsJson,
    loadPresets,
    savePresets,
} from './preset-storage';

const cheats: CheatSchema[] = [
    {
        uuid: 'toggle',
        target: 'god',
        type: ECheatType.Toggle,
        name: 'God',
        category: 'player',
        args: {},
    },
    {
        uuid: 'button',
        target: 'apply',
        type: ECheatType.Button,
        name: 'Apply',
        category: 'player',
        args: {},
    },
];

describe('preset storage', () => {
    beforeEach(() => window.localStorage.clear());

    it('captures persistent values and excludes one-shot actions', () => {
        expect(capturePresetValues(cheats, { god: true, apply: 1 })).toEqual({ god: true });
    });

    it('revives valid presets and ignores malformed entries', () => {
        window.localStorage.setItem(
            'presets',
            JSON.stringify([
                { id: 'valid', name: 'Valid', createdAt: 'now', values: { god: true } },
                { id: 'invalid', values: {} },
            ]),
        );

        expect(loadPresets('presets')).toEqual([
            { id: 'valid', name: 'Valid', createdAt: 'now', values: { god: true } },
        ]);

        savePresets('presets', []);
        expect(window.localStorage.getItem('presets')).toBeNull();
    });

    it('round-trips presets through export and import', () => {
        savePresets('presets', [{ id: 'a', name: 'A', createdAt: 'now', values: { god: true } }]);

        const json = exportPresetsJson('presets');
        savePresets('presets', []);

        const result = importPresetsJson('presets', json);
        expect(result.imported).toBe(1);
        expect(result.skipped).toBe(0);
        expect(loadPresets('presets')).toEqual([
            { id: 'a', name: 'A', createdAt: 'now', values: { god: true } },
        ]);
    });

    it('reassigns the id instead of dropping an imported preset with a colliding id', () => {
        savePresets('presets', [
            { id: 'a', name: 'Existing', createdAt: 'now', values: { god: true } },
        ]);

        const result = importPresetsJson(
            'presets',
            JSON.stringify([
                { id: 'a', name: 'Imported', createdAt: 'now', values: { god: false } },
            ]),
        );

        expect(result.imported).toBe(1);
        expect(result.presets).toHaveLength(2);
        const [existing, imported] = result.presets;
        expect(existing).toEqual({
            id: 'a',
            name: 'Existing',
            createdAt: 'now',
            values: { god: true },
        });
        expect(imported.id).not.toBe('a');
        expect(imported.name).toBe('Imported');
    });

    it('skips malformed entries without touching valid ones, and ignores non-array/non-JSON input', () => {
        savePresets('presets', []);

        const result = importPresetsJson(
            'presets',
            JSON.stringify([
                { id: 'valid', name: 'Valid', createdAt: 'now', values: { god: true } },
                { id: 'invalid' },
                'not an object',
            ]),
        );

        expect(result.imported).toBe(1);
        expect(result.skipped).toBe(2);

        expect(importPresetsJson('presets', JSON.stringify({ not: 'an array' })).imported).toBe(0);
        expect(importPresetsJson('presets', 'not json').imported).toBe(0);
    });
});
