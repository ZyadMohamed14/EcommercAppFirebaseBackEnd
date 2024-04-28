
const {logger} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
admin.initializeApp();

exports.hellowWorld = onRequest((req, res) => {
    console.debug("hello world test log")
    res.status(200).send("Hello world from android development" );
});

exports.registerUser = onRequest(async (req, res) => {
    // Check for POST request
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    // Extract user details from request body
    const {email, password, fullName} = req.body;
    if (!email || !password) {
        res.status(400).send('Missing email or password');
        return;
    }

    try {
        // Register the user with Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email: email, password: password
        });

        // Optionally, store additional user details in Firestore
        const userData = {
            email: email, fullName: fullName || '', createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await admin.firestore().collection('users').doc(userRecord.uid).set(userData);

        // Send the UID and email of the newly created user back to the client
        res.status(201).send({
            uid: userRecord.uid, email: userRecord.email
        });
    } catch (error) {
        console.error("Error creating new user:", error);
        res.status(500).send("Error creating new user: " + error.message);
    }
});
