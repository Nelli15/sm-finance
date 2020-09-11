const functions = require('firebase-functions')
const admin = require('firebase-admin')
const environment = require('./../environments/environment.js')
const serviceAccount = require('./../../tracking-tree-firebase-adminsdk-v2m7c-c63ac20490.json')
process.env.GCLOUD_PROJECT = serviceAccount.project_id
process.env.FIREBASE_CONFIG = { databaseURL: 'https://tracking-tree.firebaseio.com' }
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
process.env.FIREBASE_FIRESTORE_EMULATOR_ADDRESS = "localhost:8080";

if (!admin.apps.length) {
  admin.initializeApp(
    Object.assign(environment.firebase, {
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://tracking-tree.firebaseio.com'
    })
  )
}

module.exports = admin