const functions = require('firebase-functions')
const admin = require('firebase-admin')
// const validator = require('validator');
const nodemailer = require('nodemailer')
const cors = require('cors')({ origin: true })
const serviceAccount = require('./sp-finance-firebase-adminsdk-6mhpx-7ad8d7a061.json')
const archiver = require('archiver')

const spawn = require('child-process-promise').spawn
const path = require('path')
const os = require('os')
// const fs = require('fs');
const JPEG_EXTENSION = '.jpg'

// Get a reference to the Cloud Vision API component
const gm = require('gm').subClass({ imageMagick: true })
const Vision = require('@google-cloud/vision')
const vision = new Vision.ImageAnnotatorClient()

const Buffer = require('safe-buffer').Buffer

// TODO: on transaction updated update relevent budget and account amounts & update petty cash
// TODO: on budget updated update relevent category

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sp-finance.firebaseio.com',
  storageBucket: 'gs://sp-finance.appspot.com'
})

var db = admin.firestore()

const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ellis.nick96@gmail.com',
    pass: 'usfofbxctrovaupz'
  }
})

// Your company name to include in the emails
// TODO: Change this to your app or company name to customize the email sent.
const APP_NAME = 'Summer Project Finance'

function deleteCollection (db, collectionPath, batchSize) {
  var collectionRef = db.collection(collectionPath)
  var query = collectionRef.orderBy('__name__').limit(batchSize)

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, batchSize, resolve, reject)
  })
}

function deleteQueryBatch (db, query, batchSize, resolve, reject) {
  query
    .get()
    .then(snapshot => {
      // When there are no documents left, we are done
      if (snapshot.size === 0) {
        return 0
      }

      // Delete documents in a batch
      var batch = db.batch()
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })

      return batch.commit().then(() => {
        return snapshot.size
      })
    })
    .then(numDeleted => {
      if (numDeleted === 0) {
        resolve()
        return
      }

      // Recurse on the next process tick, to avoid
      // exploding the stack.
      process.nextTick(() => {
        deleteQueryBatch(db, query, batchSize, resolve, reject)
      })
    })
    .catch(reject)
}

exports.sendInvite = functions.firestore
  .document('/projects/{projectId}/invites/{email}')
  .onCreate(async (snap, context) => {
    // Sends a welcome email to the given user.
    function sendInviteEmail (email, displayName, project, from, permission) {
      const mailOptions = {
        from: `${APP_NAME} <noreply@firebase.com>`,
        to: email
      }

      // const emails = require('./html/emails.js')
      // The user subscribed to the newsletter.
      mailOptions.subject = `Welcome to ${APP_NAME}!`
      mailOptions.html = invite(from, project)
      return mailTransport
        .sendMail(mailOptions)
        .then(res => {
          console.log('New invite email sent to:', email)
          return true
        })
        .catch(err => {
          console.log(err)
        })
    }

    var snapData = snap.data()

    let userRef = await admin
      .firestore()
      .collection(`/users`)
      .where('email', '==', snapData.email.toLowerCase())
      .get()
    if (!userRef.empty) {
      user = userRef.docs[0].data()
      let contributorSnap = snap.ref.parent.parent
        .collection('/contributors')
        .doc(`/${userRef.docs[0].id}`)
      return contributorSnap
        .set({
          uid: userRef.docs[0].id,
          email: user.email.toLowerCase(),
          name: user.name,
          permission: snap.data().permission,
          budgets: snap.data().budgets,
          photoURL: user.photoURL
        })
        .then(res => {
          // delete the old invites
          snap.ref.delete()
        })
    }

    // check the email is lower case or it won't be found when the user logs in
    if (snapData.email !== snapData.email.toLowerCase()) {
      // email is not lower case, force email to lower case
      console.log('emails are different')
      // make email lower case
      snapData.email = snapData.email.toLowerCase()
      // create new document
      var newInvite = db.doc(
        `/projects/${
          context.params.projectId
        }/invites/${context.params.email.toLowerCase()}`
      )
      // create new batch operation
      var batch = db.batch()
      // delete the old document
      batch.delete(snap.ref)
      // update new doc with email lower case
      batch.set(newInvite, snapData)
      // commit the batch and exit, the new doc will call this function again
      return batch
        .commit()
        .then(res => {
          return true
        })
        .catch(err => {
          console.log(err)
        })
    }
    // [function ends here if email isn't lower case]

    // check if the email has been sent and send it if not
    if (!snapData.sent) {
      // email not sent
      // get the values to populate the email template
      const project = snapData.projectName
      const email = snapData.email // The email of the user.
      const displayName = snapData.name // The display name of the user.
      const from = snapData.fromName
      const permission = snapData.permission
      // send the email
      sendInviteEmail(email, displayName, project, from, permission)
      // mark the email as sent
      snapData.sent = true
    }

    // check if the user exist (has logged in before), if yes add the project to their dashboard if not await login
    return db
      .collection('/users')
      .where('email', '==', snapData.email)
      .get()
      .then(snap => {
        if (!snap.empty) {
          // user exists
          // get the user's uid
          for (var key in snap.docs) {
            let uid = snap.docs[key].id
            var batch = db.batch()
            let userData = snap.docs[key].data()
            batch.set(
              db.doc(
                `/projects/${context.params.projectId}/contributors/${uid}`
              ),
              {
                uid,
                name: userData.name,
                email: userData.email,
                photoURL: userData.photURL,
                permission: snapData.permission,
                budgets:
                  snapData.budgets.isArray() || snapData.budgets === 'all'
                    ? snapData.budgets
                    : [snapData.budgets]
              }
            )
            batch.delete(snap.ref)
            return batch
              .commit()
              .then(res => {
                return true
              })
              .catch(err => {
                console.log(err)
              })
          }
        }
      })
      .catch(err => {
        console.log(err)
      })
  })

// Listen for user sign in
exports.onUserFirstSignIn = functions.auth.user().onCreate(user => {
  // console.log(user.uid)/
  // sanitise user
  console.log(user)
  var userSanitized = {}
  userSanitized.name = user.displayName
  userSanitized.email = user.email
  userSanitized.photoURL = user.photoURL
  // userSanitized.projects = []

  // create a doc for the user
  var docRef = db.collection('/users').doc(user.uid)
  return docRef.get().then(doc => {
    // create a batch operation
    var batch = db.batch()
    // check the user doesn't exist
    if (!doc.exists) {
      console.log('Creating User Doc')
      // add the user data to the user doc
      batch.set(db.collection('/users').doc(user.uid), userSanitized)
      return db
        .collectionGroup('invites')
        .where('email', '==', userSanitized.email)
        .get()
        .then(invitesSnap => {
          invitesSnap.forEach(inviteSnap => {
            console.log(inviteSnap.data())
            // add the user to the projects they have been invited too
            batch.set(
              inviteSnap.ref.parent.parent
                .collection('/contributors')
                .doc(`/${user.uid}`),
              {
                uid: user.uid,
                email: userSanitized.email,
                name: userSanitized.name,
                permission: inviteSnap.data().permission,
                budgets: inviteSnap.data().budgets,
                photoURL: userSanitized.photoURL
              }
            )
            // delete the old invites
            batch.delete(inviteSnap.ref)
          })
          // commit the batch and exit
          return batch
            .commit()
            .then(res => {
              return true
            })
            .catch(err => {
              console.log(err)
            })
        })
    }
  })
})

exports.userUpdated = functions.firestore
  .document('/users/{uid}')
  .onUpdate((change, context) => {
    console.log(context)

    var beforeData = change.before.data()
    var afterData = change.after.data()

    if (
      beforeData.name !== afterData.name ||
      beforeData.photoURL !== afterData.photoURL
    ) {
      db.collectionGroup(`contributors`)
        .where('uid', '==', context.params.uid)
        .get()
        .then(query => {
          // update each contributor
          query.forEach(snap => {
            console.log('update contributors', {
              name: afterData.name,
              photoURL: afterData.photoURL
            })
            snap.ref.update({
              name: afterData.name,
              photoURL: afterData.photoURL
            })
          })
        })
      db.collectionGroup(`transactions`)
        .where('submittedBy.uid', '==', context.params.uid)
        .get()
        .then(query => {
          // update each contributor
          query.forEach(snap => {
            console.log('update transactions', {
              'submittedBy.displayName': afterData.name,
              'submittedBy.photoURL': afterData.photoURL
            })
            snap.ref.update({
              'submittedBy.displayName': afterData.name,
              'submittedBy.photoURL': afterData.photoURL
            })
          })
        })
      // userSnap.ref.update({name:beforeData.displayName,email:beforeData.email,photoURL:beforeData.photoURL})
    }
    return true
  })

exports.getReceipt = functions.https.onRequest(async (req, res) => {
  // console.log(req.headers.authorization)
  // console.log('Check if request is authorized with Firebase ID token');

  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session)
  ) {
    console.error(
      'No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.'
    )
    res.status(403).send('Unauthorized')
    return
  }

  let idToken
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    console.log('Found "Authorization" header')
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1]
  } else if (req.cookies) {
    console.log('Found "__session" cookie')
    // Read the ID Token from cookie.
    idToken = req.cookies.__session
  } else {
    // No cookie
    res.status(403).send('Unauthorized')
    return
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken)
    console.log('ID Token correctly decoded', decodedIdToken)
    req.user = decodedIdToken
    // next();
    // return;
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error)
    res.status(403).send('Unauthorized')
    return
  }

  // user is authorised
  console.log(req.user, req.query)

  var projectId = req.query.projectId

  db.doc(`/projects/${projectId}/contributors/${req.user.user_id}`)
    .get()
    .then(async snap => {
      if (snap.exists) {
        var id = req.query.id
        console.log(
          'user is a contributor',
          'getting file',
          `/projects/${projectId}/receipts/${projectId}-${id}.jpg`
        )
        // console.log(fileName)
        var storage = admin.storage()
        var storageRef = storage.bucket()
        var file = storageRef.file(
          `/projects/${projectId}/receipts/${projectId}-${id}.jpg`
        )

        let exists = await file.exists()
        console.log('File Exists?', exists[0])
        if (!exists[0]) {
          console.log(
            'file missing: ',
            'checking processed folder ',
            `/processed/${projectId}-${id}.jpg`
          )
          file = null
          file = storageRef.file(`/processed/${projectId}-${id}.jpg`)
          console.log(file)
          let exists2 = await file.exists()
          console.log(exists2)
          if (!exists2[0]) {
            res.status(404).send("File doesn't exist")
            return false
          }
          console.log(
            'file found',
            await file.exists(),
            `moving to: /projects/${projectId}/receipts/${projectId}-${id}.jpg`
          )
          let result = await file
            .copy(`/projects/${projectId}/receipts/${projectId}-${id}.jpg`)
            .catch(err => {
              console.error('Error #6', err)
              return err
            })
          console.log('File Copied', result)
          await file.delete().catch(err => {
            console.error('Error #7', err)
            return err
          })
          console.log('Old File deleted')
          file = result[0]
        }

        let d = new Date()
        let date = d.setHours(d.getHours() + 1)
        //   metadata.users[req.user.user_id] = date
        // }

        // await file.setMetadata(metadata)
        const config = {
          action: 'read',
          expires: date
        }
        console.log('Getting URL', config)
        let url = await file.getSignedUrl(config)

        console.log(url[0])
        res.status(200).send(url[0])
        // let file = gcs.bucket('my-bucket').file('Capture.PNG');
        // let readStream = file.createReadStream();

        // res.status(200).setHeader("content-type", "image/jpeg");
        // readStream.pipe(res);
      } else {
        res.status(403).send('Unauthorized')
      }
    })

  // res.status(200).sendFile('https://firebasestorage.googleapis.com/v0/b/sp-finance.appspot.com/o/projects%2FprojectId%2Freceipts%2FCapture.PNG?alt=media&token=b3a900c6-5ace-4270-a6a3-1142666a4c58')
})

exports.receiptUploaded = functions.storage
  .bucket()
  .object()
  .onFinalize(async (object, context) => {
    const fileBucket = object.bucket // The Storage bucket that contains the file.
    const filePath = object.name // File path in the bucket.
    const gsFilePath = `gs://${fileBucket}/${filePath}`

    if (filePath === 'uploads/undefined-undefined.jpg') return false

    if (filePath.substring(0, filePath.lastIndexOf('/')) === 'uploads') {
      console.log('file name: ', filePath, object.metadata)
      const fileName = filePath.replace(/^.*[\\\/]/, '')
      const contentType = object.contentType // File content type.
      const metageneration = object.metageneration // Number of times metadata has been generated. New objects have a value of 1.
      let metadata = object.metadata ? object.metadata : {}
      // let metadata = object.metadata
      console.log(metadata)
      if (metadata.processed) {
        if (metadata.processed === true) {
          console.log('Already processed')
          return
        }
      }

      // Exit if this is triggered on a file that is not an image.
      if (!contentType.startsWith('image/')) {
        return console.log('This is not an image.')
      }

      // Download file from bucket.
      const bucket = admin.storage().bucket(fileBucket)
      const tempFilePath = path.join(os.tmpdir(), fileName)
      const baseFileName = path.basename(filePath, path.extname(filePath))
      const fileDir = path.dirname(filePath)
      const tempLocalFile = path.join(os.tmpdir(), baseFileName)
      // let doc = db.collection(`/projects/${metadata.projectId}/transactions/`).doc()
      const JPEGFilePath = path.normalize(
        path.format({
          dir: `/processed`,
          name: `${metadata.projectId}-${metadata.transId}`,
          ext: JPEG_EXTENSION
        })
      )

      let tempLocalJPEGFile = path.join(
        os.tmpdir(),
        baseFileName.replace(/\.[^/.]+$/, '')
      )
      // const metadata = {
      //   contentType: contentType,
      //   users: {}
      // };
      let file = bucket.file(filePath)
      // await file.download({destination: tempFilePath});
      // let oldMetadata = await file.getMetadata()
      // metadata.user = {}
      console.log('Downloading file')
      await file.download({ destination: tempLocalFile }).catch(err => {
        console.error('Error #1', err)
        return err
      })
      console.log('The file has been downloaded to', tempLocalFile)

      // --------------------------- Convert the image to jpg ---------------------------- //
      if (!object.contentType.startsWith('image/jpeg')) {
        // Convert the image to JPEG using ImageMagick.
        await spawn('convert', [tempLocalFile, tempLocalJPEGFile])
        console.log('JPEG image created at', tempLocalJPEGFile)
      } else {
        console.log('Already a JPEG.')
        tempLocalJPEGFile = tempLocalFile
      }

      // -------------------------------- Uploading the JPEG image. -------------------------//
      console.log('Upload Image')
      metadata.contentType = 'image/jpeg'
      metadata.processed = true
      console.log(metadata, { destination: JPEGFilePath, metadata: metadata })
      await bucket
        .upload(tempLocalJPEGFile, {
          destination: JPEGFilePath,
          metadata: metadata
        })
        .then(() => {
          // console.log('Creating Transaction Doc ', metadata)
          // doc.set(metadata)
          //   .catch(err => {
          //     console.error('Error #3', err)
          //     return err
          //   })
        })

        // await file.copy(admin.storage().bucket().file(`/projects/${metadata.projectId}/receipts/${doc.id}.jpg`))
        .catch(err => {
          console.error('Error #4', err)
          return err
        })

      // ---------------------------- Analyse & Manipulate the image -----------------------//

      // try {
      //   // const client = new vision.ImageAnnotatorClient();
      //   const [result] = await vision.safeSearchDetection(gsFilePath);
      //   const detections = result.safeSearchAnnotation || {};

      //   if (
      //     // Levels are defined in https://cloud.google.com/vision/docs/reference/rest/v1/AnnotateImageResponse#likelihood
      //     detections.adult === 'VERY_LIKELY' ||
      //     detections.violence === 'VERY_LIKELY'
      //   ) {
      //     console.log(`Detected ${file.name} as inappropriate.`);
      //     return blurImage(file, BLURRED_BUCKET_NAME);
      //   } else {
      //     console.log(`Detected ${file.name} as OK.`);
      //   }
      // } catch (err) {
      //   console.error(`Failed to analyze ${file.name}.`, err);
      //   throw err;
      // }

      // let text = await detectText(fileBucket, filePath);
      // console.log(text)
      // doc.update({text: text})
      //       .catch(err => {
      //         console.error('Error #5', err)
      //         return err
      //       })

      // let logo = await detectLogo(fileBucket, filePath);
      // console.log(text)
      // doc.update({text: text})
      //       .catch(err => {
      //         console.error('Error #5', err)
      //         return err
      //       })
      // console.log('Setting Metadata', metadata)
      // await bucket.file(JPEGFilePath).setMetadata(metadata)
      //   .catch(err => {
      //     console.error('Error #2', err)
      //     return err
      //   })
      // console.log('Done')

      file.delete()
      return true
    }
    // else {
    //   const fileBucket = object.bucket; // The Storage bucket that contains the file.
    //   const filePath = object.name;
    //   const bucket = admin.storage().bucket(fileBucket);
    //   let file = bucket.file(filePath)
    //   console.log(filePath)
    // }
  })

// Blurs the given file using ImageMagick, and uploads it to another bucket.
const blurImage = async (file, blurredBucketName) => {
  const tempLocalPath = `/tmp/${path.parse(file.name).base}`

  // Download file from bucket.
  try {
    await file.download({ destination: tempLocalPath })

    console.log(`Downloaded ${file.name} to ${tempLocalPath}.`)
  } catch (err) {
    throw new Error(`File download failed: ${err}`)
  }

  await new Promise((resolve, reject) => {
    gm(tempLocalPath)
      .blur(0, 16)
      .write(tempLocalPath, (err, stdout) => {
        if (err) {
          console.error('Failed to blur image.', err)
          reject(err)
        } else {
          console.log(`Blurred image: ${file.name}`)
          resolve(stdout)
        }
      })
  })

  // Upload result to a different bucket, to avoid re-triggering this function.
  const blurredBucket = storage.bucket(blurredBucketName)

  // Upload the Blurred image back into the bucket.
  const gcsPath = `gs://${blurredBucketName}/${file.name}`
  try {
    await blurredBucket.upload(tempLocalPath, { destination: file.name })
    console.log(`Uploaded blurred image to: ${gcsPath}`)
  } catch (err) {
    throw new Error(`Unable to upload blurred image to ${gcsPath}: ${err}`)
  }

  // Delete the temporary file.
  const unlink = promisify(fs.unlink)
  return unlink(tempLocalPath)
}

async function detectText (bucketName, filename) {
  let text

  console.log(`Looking for text in image gs://${bucketName}/${filename}`)
  let [detections] = await vision.textDetection(
    `gs://${bucketName}/${filename}`
  )
  const annotation = detections.textAnnotations[0]
  text = annotation ? annotation.description : ''
  console.log(`Extracted text from image (${text.length} chars)`)
  return annotation
}

// async function detectLogo(bucketName, filename) {
//   let text;

//   console.log(`Looking for text in image gs://${bucketName}/${filename}`);
//   let [detections] = await vision.logoDetection(`gs://${bucketName}/${filename}`)
//   const annotation = detections.logoAnnotations[0];
//   let logos = annotation ? annotation.description : '';
//   console.log(`Logo detection`, logos);
//   return logos;
// }

exports.onTransactionDelete = functions.firestore
  .document('/projects/{projectId}/transactions/{transId}')
  .onDelete((snap, context) => {
    // deletes the reciept on transaction delete
    let projectId = context.params.projectId
    let transId = context.params.transId

    var bucket = admin.storage().bucket()
    return bucket
      .file(`/projects/${projectId}/receipts/${transId}.jpg`)
      .delete()
  })

exports.onTransactionCreate = functions.firestore
  .document('/projects/{projectId}/transactions/{transId}')
  .onCreate(async (snap, context) => {
    // on transaction create get the receipt and rename and move it to the appropriate location
    let projectId = context.params.projectId
    let transId = context.params.transId
    let snapdata = snap.data()

    console.log('Project', projectId, 'Transaction', transId)

    if (snapdata.receipt === true) {
      console.log('Receipt uploaded')
      // Move reciept image from uploads to receipts bucket

      let file = await admin
        .storage()
        .bucket()
        .file(`/processed/${projectId}-${transId}.jpg`)
      console.log(
        'file found',
        await file.exists(),
        `moving to: /projects/${projectId}/receipts/${projectId}-${transId}.jpg`
      )
      let res = await file
        .copy(`/projects/${projectId}/receipts/${projectId}-${transId}.jpg`)
        .catch(err => {
          console.error('Error #6', err)
          return err
        })
      console.log('File Copied', res)
      let newFile = res[0]
      await file.delete().catch(err => {
        console.error('Error #7', err)
        return err
      })
      console.log('Old File deleted')
    } else {
      console.log('No receipt uploaded')
    }
    return true
  })

// TODO: make this use optimistic locking
exports.onTransactionWrite = functions.firestore
  .document('/projects/{projectId}/transactions/{transId}')
  .onWrite(async (change, context) => {
    // Get an object with the current document value.
    let projectId = context.params.projectId
    let transId = context.params.transId
    // If the document does not exist, it has been deleted.
    const newDoc = change.after.exists ? change.after.data() : null

    // Get an object with the previous document value (for update or delete)
    const oldDoc = change.before.exists ? change.before.data() : null
    if (oldDoc !== null && newDoc !== null) {
      if (
        newDoc.amount === oldDoc.amount &&
        newDoc.to === oldDoc.to &&
        newDoc.from === oldDoc.from &&
        newDoc.budget === oldDoc.budget &&
        newDoc.category === oldDoc.category &&
        newDoc.deleted === oldDoc.deleted
      ) {
        console.log('no change detected')
        return true
      }
    }

    let budgets = []

    if (oldDoc === null) {
      // create

      // make a list of all the budgets to be updated
      if (newDoc.category === 'Expense' || newDoc.category === 'Income') {
        budgets.push(newDoc.budget)
      } else if (newDoc.category === 'Journal') {
        budgets.push(newDoc.to)
        budgets.push(newDoc.from)
      }
    } else if (oldDoc !== null && newDoc !== null) {
      // update
      // make a list of all the budgets to be updated
      if (oldDoc.category === 'Expense' || oldDoc.category === 'Income') {
        budgets.push(oldDoc.budget)
      } else if (oldDoc.category === 'Journal') {
        budgets.push(oldDoc.to)
        budgets.push(oldDoc.from)
      }
      if (newDoc.category === 'Expense' || newDoc.category === 'Income') {
        budgets.push(newDoc.budget)
      } else if (newDoc.category === 'Journal') {
        budgets.push(newDoc.to)
        budgets.push(newDoc.from)
      }
    } else {
      // delete
      // make a list of all the budgets to be updated
      if (oldDoc.category === 'Expense' || oldDoc.category === 'Income') {
        budgets.push(oldDoc.budget)
      } else if (oldDoc.category === 'Journal') {
        budgets.push(oldDoc.to)
        budgets.push(oldDoc.from)
      }
    }

    budgets = budgets.filter((val, index, self) => {
      return self.indexOf(val) === index
    })

    console.log('updating budgets: ', budgets)

    // loop through all the budgets to update each one
    for (var budgetKey in budgets) {
      let budget = budgets[budgetKey]
      let expenses = 0,
        income = 0
      // get all the related transactions and update the expense totals
      let promises = [
        db
          .collection(`/projects/${projectId}/transactions/`)
          .where('category', '==', 'Expense')
          .where('budget', '==', budget)
          .get()
          .then(query => {
            query.forEach(docRef => {
              if (!docRef.get('deleted')) {
                expenses += parseFloat(docRef.get('amount'))
              }
            })
            return true
          }),
        db
          .collection(`/projects/${projectId}/transactions/`)
          .where('category', '==', 'Journal')
          .where('from', '==', budget)
          .get()
          .then(query => {
            query.forEach(docRef => {
              if (!docRef.get('deleted')) {
                expenses += parseFloat(docRef.get('amount'))
              }
            })
            return true
          }),
        db
          .collection(`/projects/${projectId}/transactions/`)
          .where('category', '==', 'Income')
          .where('budget', '==', budget)
          .get()
          .then(query => {
            query.forEach(docRef => {
              if (!docRef.get('deleted')) {
                income += parseFloat(docRef.get('amount'))
              }
            })
            return true
          }),
        db
          .collection(`/projects/${projectId}/transactions/`)
          .where('category', '==', 'Journal')
          .where('to', '==', budget)
          .get()
          .then(query => {
            query.forEach(docRef => {
              if (!docRef.get('deleted')) {
                income += parseFloat(docRef.get('amount'))
              }
            })
            return true
          })
      ]
      await Promise.all(promises)
      db.doc(`/projects/${projectId}/accounts/${budget}`).update({
        expenses: expenses,
        income: income
      })
    }
  })

// TODO: work out what this does
exports.onAccountWrite = functions.firestore
  .document('/projects/{projectId}/accounts/{accountId}')
  .onWrite(async (change, context) => {
    //

    // Get an object with the current document value.
    let projectId = context.params.projectId
    let accountId = context.params.accountId

    // If the document does not exist, it has been deleted.
    const newDoc = change.after.exists ? change.after.data() : null

    // Get an object with the previous document value (for update or delete)
    const oldDoc = change.before.exists ? change.before.data() : null

    // nothing to do if the account is of type account or category so return
    if (newDoc.type !== 'budget') {
      return true
    }

    // get the relevant accountcategories that need updating

    //     // accounts = accounts.filter((val, index, self) => {
    //     //   return self.indexOf(val) === index
    //     // })

    console.log('updating account Category Totals: ', accounts)

    // loop through all the accounts to update each one
    for (var accountKey in accounts) {
      let account = accounts[accountKey]
      let expenses = 0,
        income = 0,
        budget = 0,
        val = 0

      // get all the related transactions and update the expense totals
      let promises = [
        db
          .collection(`/projects/${projectId}/accounts/`)
          .where('type', '==', 'budget')
          .where('category', '==', account)
          .get()
          .then(query => {
            query.forEach(docRef => {
              val = docRef.get('budget')
              budget += parseFloat(val) > 0 ? parseFloat(val) : 0
              val = docRef.get('expenses')
              expenses += parseFloat(val) > 0 ? parseFloat(val) : 0
              // console.log(parseFloat(val) > 0, expenses)
              val = docRef.get('income')
              income += parseFloat(val) > 0 ? parseFloat(val) : 0
            })
            return true
          })
      ]
      await Promise.all(promises)
      // console.log({ budget: budget, expenses: expenses, income: income })
      db.doc(`/projects/${projectId}/accounts/${account}`).update({
        budget: budget,
        expenses: expenses,
        income: income
      })
    }
  })

// doesn't work due to issue with max size of transfer, 10MB i think
exports.downloadReceiptsZip = functions.https.onRequest(async (req, res) => {
  // var app = require('express')();
  // var p = require('path');

  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session)
  ) {
    console.error(
      'No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.'
    )
    res.status(403).send('Unauthorized')
    return
  }

  let idToken
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    console.log('Found "Authorization" header')
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1]
  } else if (req.cookies) {
    console.log('Found "__session" cookie')
    // Read the ID Token from cookie.
    idToken = req.cookies.__session
  } else {
    // No cookie
    res.status(403).send('Unauthorized')
    return
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken)
    console.log('ID Token correctly decoded')
    req.user = decodedIdToken
    // next();
    // return;
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error)
    res.status(403).send('Unauthorized')
    return
  }

  // user is authorised
  // console.log(req.user, req.query)

  var projectId = req.query.projectId

  db.doc(`/projects/${projectId}/contributors/${req.user.user_id}`)
    .get()
    .then(async snap => {
      if (snap.exists) {
        // var id = req.query.id
        // console.log('user is a contributor', 'getting file')

        // var archive = archiver('zip')

        // archive.on('error', function (err) {
        //   res.status(500).send({ error: err.message })
        // })

        // // on stream closed we can end the request
        // archive.on('end', function () {
        //   console.log('Archive wrote %d bytes', archive.pointer())
        // })

        // // set the archive name
        // res.attachment('download.zip')

        // // this is the streaming magic
        // archive.pipe(res)
        let d = new Date()
        let date = d.setHours(d.getHours() + 1)

        const config = {
          action: 'read',
          expires: date
        }

        // console.log(`projects/${req.query.projectId}/receipts/`)
        let [files] = await admin
          .storage()
          .bucket()
          .getFiles({
            delimiter: '/',
            prefix: `projects/${req.query.projectId}/receipts/` /// ${req.query.projectId}/receipts/`
          })
          .catch(err => {
            console.error(err)
          })
        const receipts = {}
        console.log('found: ' + files.length + ' files')
        for (var fileId in files) {
          const file = files[fileId]
          // TODO: change file name to just reciept id
          const data = await file.getSignedUrl(config).catch(err => {
            console.error(err)
          })
          // const metadata = await file.getMetadata().catch(err => {
          //   console.error(err)
          // })
          receipts[file.metadata.name] = data
          // console.log(file.metadata)
        }

        res.status(200).send(receipts)
      } else {
        res.status(403).send('Unauthorized')
      }
    })
})

exports.downloadCSV = functions.https.onRequest(async (req, res) => {
  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session)
  ) {
    console.error(
      'No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.'
    )
    res.status(403).send('Unauthorized')
    return
  }

  let idToken
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    console.log('Found "Authorization" header')
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1]
  } else if (req.cookies) {
    console.log('Found "__session" cookie')
    // Read the ID Token from cookie.
    idToken = req.cookies.__session
  } else {
    // No cookie
    res.status(403).send('Unauthorized')
    return
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken)
    console.log('ID Token correctly decoded', decodedIdToken)
    req.user = decodedIdToken
    // next();
    // return;
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error)
    res.status(403).send('Unauthorized')
    return
  }

  var projectId = req.query.projectId
  console.log(projectId)
  console.log(`/projects/${projectId}`)
  let project = await db
    .doc(`/projects/${projectId}`)
    .get()
    .catch(err => {
      console.log(err)
    })
  console.log(`/projects/${projectId}/accounts`)
  let accounts = await db
    .collection(`/projects/${projectId}/accounts`)
    .get()
    .catch(err => {
      console.log(err)
    })
  let accountDocs = {}
  await accounts.forEach(account => {
    accountDocs[account.id] = account.data()
  })
  // console.log(`/projects/${projectId}/transactions`)
  let transactions = await db
    .collection(`/projects/${projectId}/transactions`)
    .get()
    .catch(err => {
      console.log(err)
    })
  // console.log(transactions)
  let transArray = [
    [
      'sp_code',
      'trans_number',
      'trans_international?',
      'trans_aus_currency_amt',
      'trans_aus_gst',
      'trans_int_currency',
      'trans_int_curreny_amt',
      'trans_int_aud_equiv',
      'trans_date',
      'trans_type',
      'trans_category',
      'trans_cheque',
      'trans_description',
      'trans_deleted?'
    ]
  ]
  let index = 1
  transactions.forEach(transaction => {
    let transData = transaction.data()
    if (transData.category === 'Expense') {
      let account = accountDocs[transData.budget]
      if (account.type !== 'account') {
        let categoryId = account.category
        let categoryDoc = accountDocs[categoryId]
        transArray[index] = [
          project.get('number'),
          transaction.id,
          0, // international transfer? 0 if no, 1? if yes
          transData.amount,
          transData.GST,
          '', // currency, blank if not international transfer
          '', // amount in international currency
          '', // equivalent amount in AUD
          transData.date,
          transData.type,
          categoryDoc.label,
          transData.cheque,
          transData.desc > '' ? transData.desc.replace(/,/g, '-') : '',
          transData.deleted === true ? 1 : 0
        ]
        index++
      }
      // else {
      //   transArray[index] = [project.get('number'), transaction.id, 0, transData.amount, transData.GST, '', '', '', transData.date, transData.type, account.label, transData.cheque, transData.desc, transData.deleted]
      //   index++
      // }
    } else if (transData.category === 'Journal') {
      // console.log(
      //   transData,
      //   accountDocs[transData.to].type,
      //   accountDocs[transData.from].type
      // )
      if (
        accountDocs[transData.to].type === 'account' &&
        accountDocs[transData.from].type === 'account'
      ) {
        transArray[index] = [
          project.get('number'),
          transaction.id,
          0,
          transData.from === 'pettyCash'
            ? -1 * parseFloat(transData.amount)
            : transData.amount,
          transData.GST,
          '',
          '',
          '',
          transData.date,
          transData.type,
          'Petty Cash',
          transData.cheque,
          transData.desc > '' ? transData.desc.replace(/,/g, '-') : '',
          transData.deleted === true ? 1 : 0
        ]
        index++
      }
    }
  })
  // console.log(transArray.map(e => e.join(',')).join('\n'))
  res.status(200).send(transArray.map(e => e.join(',')).join('\n'))
})

exports.createProject = functions.https.onCall(async (data, context) => {
  console.log(context.auth)
  let projectRef = admin
    .firestore()
    .collection(`/projects`)
    .doc()
  await projectRef.set({
    name: 'Untitled Project',
    number: '',
    participants: '',
    currency: 'AUD',
    internationalProject: false,
    petty: {
      dollars: {
        hundreds: 0,
        fifties: 0,
        twenties: 0,
        tens: 0,
        fives: 0,
        twos: 0,
        ones: 0
      },
      cents: {
        fifties: 0,
        twenties: 0,
        tens: 0,
        fives: 0
      }
    }
  })
  projectRef
    .collection('/contributors')
    .doc(context.auth.uid)
    .set({
      email: context.auth.token.email,
      name: context.auth.token.name,
      uid: context.auth.uid,
      permission: 'admin',
      photoUrl: context.auth.token.picture
    })
  let accountsRef = projectRef.collection('/accounts')
  accountsRef.doc('debitCard').set({
    label: 'Debit Card',
    systemAccount: false,
    type: 'account',
    inHeader: true
  })
  accountsRef.doc('pettyCash').set({
    label: 'Petty Cash',
    systemAccount: false,
    type: 'account',
    inHeader: true
  })
})

function invite (from, project) {
  return `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><!-- NAME: SELL PRODUCTS --><!--[if gte mso 15]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]--><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1"><style type="text/css">p{margin:10px 0;padding:0;}table{border-collapse:collapse;}h1,h2,h3,h4,h5,h6{display:block;margin:0;padding:0;}img,a img{border:0;height:auto;outline:none;text-decoration:none;}body,#bodyTable,#bodyCell{height:100%;margin:0;padding:0;width:100%;}.mcnPreviewText{display:none !important;}#outlook a{padding:0;}img{-ms-interpolation-mode:bicubic;}table{mso-table-lspace:0pt;mso-table-rspace:0pt;}.ReadMsgBody{width:100%;}.ExternalClass{width:100%;}p,a,li,td,blockquote{mso-line-height-rule:exactly;}a[href^=tel],a[href^=sms]{color:inherit;cursor:default;text-decoration:none;}p,a,li,td,body,table,blockquote{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;}.ExternalClass,.ExternalClass p,.ExternalClass td,.ExternalClass div,.ExternalClass span,.ExternalClass font{line-height:100%;}a[x-apple-data-detectors]{color:inherit !important;text-decoration:none !important;font-size:inherit !important;font-family:inherit !important;font-weight:inherit !important;line-height:inherit !important;}.templateContainer{max-width:600px !important;}a.mcnButton{display:block;}.mcnImage,.mcnRetinaImage{vertical-align:bottom;}.mcnTextContent{word-break:break-word;}.mcnTextContent img{height:auto !important;}.mcnDividerBlock{table-layout:fixed !important;}h1{color:#222222;font-family:Helvetica;font-size:40px;font-style:normal;font-weight:bold;line-height:150%;letter-spacing:normal;text-align:center;}h2{color:#222222;font-family:Helvetica;font-size:34px;font-style:normal;font-weight:bold;line-height:150%;letter-spacing:normal;text-align:left;}h3{color:#444444;font-family:Helvetica;font-size:22px;font-style:normal;font-weight:bold;line-height:150%;letter-spacing:normal;text-align:left;}h4{color:#949494;font-family:Georgia;font-size:20px;font-style:italic;font-weight:normal;line-height:125%;letter-spacing:normal;text-align:left;}#templateHeader{background-color:#F7F7F7;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:45px;padding-bottom:45px;}.headerContainer{background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0;}.headerContainer .mcnTextContent,.headerContainer .mcnTextContent p{color:#757575;font-family:Helvetica;font-size:16px;line-height:150%;text-align:left;}.headerContainer .mcnTextContent a,.headerContainer .mcnTextContent p a{color:#007C89;font-weight:normal;text-decoration:underline;}#templateBody{background-color:#FFFFFF;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:36px;padding-bottom:45px;}.bodyContainer{background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0;}.bodyContainer .mcnTextContent,.bodyContainer .mcnTextContent p{color:#757575;font-family:Helvetica;font-size:16px;line-height:150%;text-align:left;}.bodyContainer .mcnTextContent a,.bodyContainer .mcnTextContent p a{color:#007C89;font-weight:normal;text-decoration:underline;}#templateFooter{background-color:#333333;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0px;padding-bottom:0px;}.footerContainer{background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0;}.footerContainer .mcnTextContent,.footerContainer .mcnTextContent p{color:#FFFFFF;font-family:Helvetica;font-size:12px;line-height:150%;text-align:center;}.footerContainer .mcnTextContent a,.footerContainer .mcnTextContent p a{color:#FFFFFF;font-weight:normal;text-decoration:underline;}@media only screen and (min-width:768px){.templateContainer{width:600px !important;}}@media only screen and (max-width: 480px){body,table,td,p,a,li,blockquote{-webkit-text-size-adjust:none !important;}}@media only screen and (max-width: 480px){body{width:100% !important;min-width:100% !important;}}@media only screen and (max-width: 480px){.mcnRetinaImage{max-width:100% !important;}}@media only screen and (max-width: 480px){.mcnImage{width:100% !important;}}@media only screen and (max-width: 480px){.mcnCartContainer,.mcnCaptionTopContent,.mcnRecContentContainer,.mcnCaptionBottomContent,.mcnTextContentContainer,.mcnBoxedTextContentContainer,.mcnImageGroupContentContainer,.mcnCaptionLeftTextContentContainer,.mcnCaptionRightTextContentContainer,.mcnCaptionLeftImageContentContainer,.mcnCaptionRightImageContentContainer,.mcnImageCardLeftTextContentContainer,.mcnImageCardRightTextContentContainer,.mcnImageCardLeftImageContentContainer,.mcnImageCardRightImageContentContainer{max-width:100% !important;width:100% !important;}}@media only screen and (max-width: 480px){.mcnBoxedTextContentContainer{min-width:100% !important;}}@media only screen and (max-width: 480px){.mcnImageGroupContent{padding:9px !important;}}@media only screen and (max-width: 480px){.mcnCaptionLeftContentOuter .mcnTextContent,.mcnCaptionRightContentOuter .mcnTextContent{padding-top:9px !important;}}@media only screen and (max-width: 480px){.mcnImageCardTopImageContent,.mcnCaptionBottomContent:last-child .mcnCaptionBottomImageContent,.mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent{padding-top:18px !important;}}@media only screen and (max-width: 480px){.mcnImageCardBottomImageContent{padding-bottom:9px !important;}}@media only screen and (max-width: 480px){.mcnImageGroupBlockInner{padding-top:0 !important;padding-bottom:0 !important;}}@media only screen and (max-width: 480px){.mcnImageGroupBlockOuter{padding-top:9px !important;padding-bottom:9px !important;}}@media only screen and (max-width: 480px){.mcnTextContent,.mcnBoxedTextContentColumn{padding-right:18px !important;padding-left:18px !important;}}@media only screen and (max-width: 480px){.mcnImageCardLeftImageContent,.mcnImageCardRightImageContent{padding-right:18px !important;padding-bottom:0 !important;padding-left:18px !important;}}@media only screen and (max-width: 480px){.mcpreview-image-uploader{display:none !important;width:100% !important;}}@media only screen and (max-width: 480px){h1{font-size:30px !important;line-height:125% !important;}}@media only screen and (max-width: 480px){h2{font-size:26px !important;line-height:125% !important;}}@media only screen and (max-width: 480px){h3{font-size:20px !important;line-height:150% !important;}}@media only screen and (max-width: 480px){h4{font-size:18px !important;line-height:150% !important;}}@media only screen and (max-width: 480px){.mcnBoxedTextContentContainer .mcnTextContent,.mcnBoxedTextContentContainer .mcnTextContent p{font-size:14px !important;line-height:150% !important;}}@media only screen and (max-width: 480px){.headerContainer .mcnTextContent,.headerContainer .mcnTextContent p{font-size:16px !important;line-height:150% !important;}}@media only screen and (max-width: 480px){.bodyContainer .mcnTextContent,.bodyContainer .mcnTextContent p{font-size:16px !important;line-height:150% !important;}}@media only screen and (max-width: 480px){.footerContainer .mcnTextContent,.footerContainer .mcnTextContent p{font-size:14px !important;line-height:150% !important;}}</style></head><body style="height: 100%;margin: 0;padding: 0;width: 100%;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"><!----><center><table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;height: 100%;margin: 0;padding: 0;width: 100%;"><tbody><tr><td align="center" valign="top" id="bodyCell" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;height: 100%;margin: 0;padding: 0;width: 100%;"><!-- BEGIN TEMPLATE // --><table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"><tbody><tr><td align="center" valign="top" id="templateHeader" data-template-container="" style="background:#F7F7F7 none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: #000000;background-image: url('https://firebasestorage.googleapis.com/v0/b/sp-finance.appspot.com/o/assets%2Fherson-rodriguez-ueP3nDeqPLY-unsplash.jpg?alt=media&amp;token=34eac538-a272-4039-be17-c77a05c27da7');background-repeat: no-repeat;background-position: bottom;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 45px;padding-bottom: 45px;"><!--[if (gte mso 9)|(IE)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;"><tr><td align="center" valign="top" width="600" style="width:600px;"><![endif]--><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;max-width: 600px !important;"><tbody><tr><td valign="top" class="headerContainer" style="background:transparent none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: transparent;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 0;padding-bottom: 0;"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnImageBlock" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"><tbody class="mcnImageBlockOuter"><tr><td valign="top" style="padding: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;" class="mcnImageBlockInner"><table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" class="mcnImageContentContainer" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"><tbody><tr><td class="mcnImageContent" valign="top" style="padding-right: 9px;padding-left: 9px;padding-top: 0;padding-bottom: 0;text-align: center;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"></td></tr></tbody></table></td></tr></tbody></table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"><tbody class="mcnTextBlockOuter"><tr><td valign="top" class="mcnTextBlockInner" style="padding-top: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"><!--[if mso]><table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;"><tr><![endif]--><!--[if mso]><td valign="top" width="600" style="width:600px;"><![endif]--><table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width: 100%;min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;" width="100%" class="mcnTextContentContainer"><tbody><tr><td valign="top" class="mcnTextContent" style="padding-top: 0;padding-right: 18px;padding-bottom: 9px;padding-left: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;word-break: break-word;color: #757575;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;"><h1 style="display: block;margin: 0;padding: 0;color: #222222;font-family: Helvetica;font-size: 40px;font-style: normal;font-weight: bold;line-height: 150%;letter-spacing: normal;text-align: center;">You have been invited to Summer Projects Finance</h1></td></tr></tbody></table><!--[if mso]></td><![endif]--><!--[if mso]></tr></table><![endif]--></td></tr></tbody></table></td></tr></tbody></table><!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]--></td></tr><tr><td align="center" valign="top" id="templateBody" data-template-container="" style="background:#FFFFFF none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: #FFFFFF;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 36px;padding-bottom: 45px;"><!--[if (gte mso 9)|(IE)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;"><tr><td align="center" valign="top" width="600" style="width:600px;"><![endif]--><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;max-width: 600px !important;"><tbody><tr><td valign="top" class="bodyContainer" style="background:transparent none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: transparent;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 0;padding-bottom: 0;"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"><tbody class="mcnTextBlockOuter"><tr><td valign="top" class="mcnTextBlockInner" style="padding-top: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"><!--[if mso]><table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;"><tr><![endif]--><!--[if mso]><td valign="top" width="600" style="width:600px;"><![endif]--><table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width: 100%;min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;" width="100%" class="mcnTextContentContainer"><tbody><tr><td valign="top" class="mcnTextContent" style="padding-top: 0;padding-right: 18px;padding-bottom: 9px;padding-left: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;word-break: break-word;color: #757575;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;"><h3 style="text-align: center;display: block;margin: 0;padding: 0;color: #444444;font-family: Helvetica;font-size: 22px;font-style: normal;font-weight: bold;line-height: 150%;letter-spacing: normal;">${from} has invited you to contribute to the ${project} project on the Summer Project Finance App.</h3></td></tr></tbody></table><!--[if mso]></td><![endif]--><!--[if mso]></tr></table><![endif]--></td></tr></tbody></table>
<table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnButtonBlock" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"><tbody class="mcnButtonBlockOuter"><tr><td style="padding-top: 0;padding-right: 18px;padding-bottom: 18px;padding-left: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;" valign="top" align="center" class="mcnButtonBlockInner"><table border="0" cellpadding="0" cellspacing="0" class="mcnButtonContentContainer" style="border-collapse: separate !important;border-radius: 3px;background-color: #26a69a;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"><tbody><tr><td align="center" valign="middle" class="mcnButtonContent" style="font-family: Helvetica;font-size: 18px;padding: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"><a class="mcnButton " title="Get Started" href="https://sp-finance.web.app" target="_blank" style="font-weight: bold;letter-spacing: -0.5px;line-height: 100%;text-align: center;text-decoration: none;color: #FFFFFF;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;display: block;">Get Started</a></td></tr></tbody></table></td></tr></tbody></table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"><tbody class="mcnTextBlockOuter"><tr><td valign="top" class="mcnTextBlockInner" style="padding-top: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"><!--[if mso]><table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;"><tr><![endif]--><!--[if mso]><td valign="top" width="600" style="width:600px;"><![endif]--><table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width: 100%;min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;" width="100%" class="mcnTextContentContainer"><tbody><tr><td valign="top" class="mcnTextContent" style="padding-top: 0;padding-right: 18px;padding-bottom: 9px;padding-left: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;word-break: break-word;color: #757575;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;"><h6 style="text-align: center;display: block;margin: 0;padding: 0;color: #444444;font-family: Helvetica;font-size: 16px;font-style: normal;font-weight: normal;line-height: 150%;letter-spacing: normal;">The Summer Projects Finance App is used to keep track of all of the receipts and transactions on a Power to Change Summer Project. 
If you are a student you will be provided with a form that will allow you to upload receipts and other transactions that you make. Please check with your finance person or project leaders if you have any questions.
</h6></td></tr></tbody></table><!--[if mso]></td><![endif]--><!--[if mso]></tr></table><![endif]--></td></tr></tbody></table>
<table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnDividerBlock" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;table-layout: fixed !important;"><tbody class="mcnDividerBlockOuter"><tr><td class="mcnDividerBlockInner" style="min-width: 100%;padding: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"><table class="mcnDividerContent" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"><tbody><tr><td style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;"><span></span></td></tr></tbody></table><!--<td class="mcnDividerBlockInner" style="padding: 18px;"><hr class="mcnDividerContent" style="border-bottom-color:none; border-left-color:none; border-right-color:none; border-bottom-width:0; border-left-width:0; border-right-width:0; margin-top:0; margin-right:0; margin-bottom:0; margin-left:0;" />--></td></tr></tbody></table></td></tr></tbody></table><!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]--></td></tr><tr><td align="center" valign="top" id="templateFooter" data-template-container="" style="background:#333333 none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: #333333;background-image: 'https://firebasestorage.googleapis.com/v0/b/sp-finance.appspot.com/o/assets%2Fherson-rodriguez-ueP3nDeqPLY-unsplash.jpg?alt=media&amp;token=34eac538-a272-4039-be17-c77a05c27da7';background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 0px;padding-bottom: 0px;"><!--[if (gte mso 9)|(IE)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;"><tr><td align="center" valign="top" width="600" style="width:600px;"><![endif]--><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;max-width: 600px !important;"><tbody><tr><td valign="top" class="footerContainer" style="background:transparent none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: transparent;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 0;padding-bottom: 0;"></td></tr></tbody></table><!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]--></td></tr></tbody></table><!-- // END TEMPLATE --></td></tr></tbody></table></center></body></html>` // email content in HTML
}
