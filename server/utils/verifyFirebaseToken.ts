import jwt from 'jsonwebtoken';

const GOOGLE_CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

let cachedCerts: Record<string, string> = {};
let cacheExpiry = 0;

async function getGoogleCerts(): Promise<Record<string, string>> {
    const now = Date.now();
    if (cachedCerts && cacheExpiry > now) {
        return cachedCerts;
    }

    const response = await fetch(GOOGLE_CERTS_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch Google public keys: ${response.statusText}`);
    }

    cachedCerts = await response.json();

    // Cache for 1 hour
    cacheExpiry = now + 3600 * 1000;

    return cachedCerts;
}

export interface DecodedFirebaseToken {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
    email_verified?: boolean;
    [key: string]: any;
}

/**
 * Verifies a Firebase ID token using Google's public keys directly.
 * This does NOT require Firebase Admin SDK credentials.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<DecodedFirebaseToken> {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'evelify';

    // 1. Decode the header to find which key was used to sign
    const decoded = jwt.decode(idToken, { complete: true });
    if (!decoded || typeof decoded === 'string') {
        throw new Error('Invalid token: could not decode');
    }

    const kid = decoded.header.kid;
    if (!kid) {
        throw new Error('Invalid token: no key ID (kid) in header');
    }

    // 2. Fetch Google's public signing keys
    const certs = await getGoogleCerts();
    const publicKey = certs[kid];
    if (!publicKey) {
        // Invalidate cache and retry once in case keys rotated
        cacheExpiry = 0;
        const freshCerts = await getGoogleCerts();
        const freshKey = freshCerts[kid];
        if (!freshKey) {
            throw new Error('Invalid token: public key not found for kid: ' + kid);
        }
        // Use freshKey below
        const payload = jwt.verify(idToken, freshKey, {
            algorithms: ['RS256'],
            audience: projectId,
            issuer: `https://securetoken.google.com/${projectId}`,
        }) as DecodedFirebaseToken;
        payload.uid = payload.sub || payload.user_id;
        return payload;
    }

    // 3. Verify signature and claims
    const payload = jwt.verify(idToken, publicKey, {
        algorithms: ['RS256'],
        audience: projectId,
        issuer: `https://securetoken.google.com/${projectId}`,
    }) as DecodedFirebaseToken;

    payload.uid = payload.sub || payload.user_id;
    return payload;
}
