import admin from 'firebase-admin';

if (admin && admin.apps && !admin.apps.length) {
    admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'evelify'
    });
}

export default admin;
