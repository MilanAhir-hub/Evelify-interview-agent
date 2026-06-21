import admin from 'firebase-admin';

if (admin && admin.apps && !admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'evelify';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (clientEmail && privateKey) {
        // Production: use service account credentials
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
        console.log('Firebase Admin initialized with service account credentials');
    } else {
        // Fallback: initialize without credentials (works on GCP or for local dev)
        admin.initializeApp({ projectId });
        console.log('Firebase Admin initialized with projectId only (no service account)');
    }
}

export default admin;
