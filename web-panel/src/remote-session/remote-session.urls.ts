import { WEB_CONTRACT } from '../../protocol/contract';
import { loadString, saveString } from '../shared/storage';

export const WS_QUERY_PARAM = 'ws';
export const TOKEN_QUERY_PARAM = WEB_CONTRACT.pairingTokenQueryParam;

const PAIRING_TOKEN_STORAGE_KEY = 'wand-remote.pairing-token.v1';

const DEV_SERVER_PORTS = new Set(WEB_CONTRACT.devServerPorts.map(String));

function protocolForWebSocket(): 'ws' | 'wss' {
    return window.location.protocol === 'https:' ? 'wss' : 'ws';
}

function isServedByRemoteBridge(): boolean {
    return (
        window.location.pathname.startsWith(WEB_CONTRACT.basePath) &&
        !DEV_SERVER_PORTS.has(window.location.port)
    );
}

export function readInitialWebSocketUrl(): string {
    const params = new URLSearchParams(window.location.search);
    const explicitUrl = params.get(WS_QUERY_PARAM)?.trim();
    if (explicitUrl) {
        return explicitUrl;
    }

    if (isServedByRemoteBridge()) {
        return `${protocolForWebSocket()}://${window.location.host}${WEB_CONTRACT.webSocketPath}`;
    }

    return `ws://127.0.0.1:${WEB_CONTRACT.defaultRemotePort}${WEB_CONTRACT.webSocketPath}`;
}

/**
 * The pairing token proves this device scanned the bridge's QR/pairing link. A token
 * carried on the page URL (from a fresh scan) is persisted so later visits/reconnects
 * without that query param - a bookmarked page, a manually edited WS URL - stay paired.
 */
export function readInitialPairingToken(): string {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get(TOKEN_QUERY_PARAM)?.trim();
    if (fromUrl) {
        saveString(PAIRING_TOKEN_STORAGE_KEY, fromUrl);
        return fromUrl;
    }

    return loadString(PAIRING_TOKEN_STORAGE_KEY)?.trim() || '';
}
