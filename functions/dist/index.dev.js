"use strict";

var _updateCatAmounts = _interopRequireDefault(require("./src/modules/dist/updateCatAmounts.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var functions = require('firebase-functions');

var admin = require('firebase-admin');

var environment = require('./src/environments/environment.js');

var context = {
  admin: admin,
  environment: environment
}; //import functions

// const validator = require('validator');
var nodemailer = require('nodemailer');

var cors = require('cors')({
  origin: true
});

var serviceAccount = require('./sp-finance-firebase-adminsdk-6mhpx-7ad8d7a061.json');

var spawn = require('child-process-promise').spawn;

var path = require('path');

var os = require('os'); // const fs = require('fs');


var JPEG_EXTENSION = '.jpg'; // Get a reference to the Cloud Vision API component

var gm = require('gm').subClass({
  imageMagick: true
});

var Vision = require('@google-cloud/vision');

var vision = new Vision.ImageAnnotatorClient();

var Buffer = require('safe-buffer').Buffer; // TODO: on transaction updated update relevent budget and account amounts & update petty cash
// TODO: on budget updated update relevent category


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sp-finance.firebaseio.com',
  storageBucket: 'gs://sp-finance.appspot.com'
});
var db = admin.firestore();
var mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ellis.nick96@gmail.com',
    pass: 'usfofbxctrovaupz'
  }
}); // Your company name to include in the emails
// TODO: Change this to your app or company name to customize the email sent.

var APP_NAME = 'Summer Project Finance';

function deleteCollection(db, collectionPath, batchSize) {
  var collectionRef = db.collection(collectionPath);
  var query = collectionRef.orderBy('__name__').limit(batchSize);
  return new Promise(function (resolve, reject) {
    deleteQueryBatch(db, query, batchSize, resolve, reject);
  });
}

function deleteQueryBatch(db, query, batchSize, resolve, reject) {
  query.get().then(function (snapshot) {
    // When there are no documents left, we are done
    if (snapshot.size === 0) {
      return 0;
    } // Delete documents in a batch


    var batch = db.batch();
    snapshot.docs.forEach(function (doc) {
      batch["delete"](doc.ref);
    });
    return batch.commit().then(function () {
      return snapshot.size;
    });
  }).then(function (numDeleted) {
    if (numDeleted === 0) {
      resolve();
      return;
    } // Recurse on the next process tick, to avoid
    // exploding the stack.


    process.nextTick(function () {
      deleteQueryBatch(db, query, batchSize, resolve, reject);
    });
  })["catch"](reject);
}

exports.sendInvite = functions.firestore.document('/projects/{projectId}/invites/{email}').onCreate(function _callee(snap, context) {
  var sendInviteEmail, snapData, userRef, contributorSnap, newInvite, batch, project, email, displayName, from, permission;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          sendInviteEmail = function _ref(email, displayName, project, from, permission) {
            var mailOptions = {
              from: "".concat(APP_NAME, " <noreply@firebase.com>"),
              to: email
            }; // const emails = require('./html/emails.js')
            // The user subscribed to the newsletter.

            mailOptions.subject = "Welcome to ".concat(APP_NAME, "!");
            mailOptions.html = invite(from, project);
            return mailTransport.sendMail(mailOptions).then(function (res) {
              console.log('New invite email sent to:', email);
              return true;
            })["catch"](function (err) {
              console.log(err);
            });
          };

          snapData = snap.data();
          _context.next = 4;
          return regeneratorRuntime.awrap(admin.firestore().collection("/users").where('email', '==', snapData.email.toLowerCase()).get());

        case 4:
          userRef = _context.sent;

          if (userRef.empty) {
            _context.next = 9;
            break;
          }

          user = userRef.docs[0].data();
          contributorSnap = snap.ref.parent.parent.collection('/contributors').doc("/".concat(userRef.docs[0].id));
          return _context.abrupt("return", contributorSnap.set({
            uid: userRef.docs[0].id,
            email: user.email.toLowerCase(),
            name: user.name,
            permission: snap.data().permission,
            budgets: snap.data().budgets,
            photoURL: user.photoURL
          }).then(function (res) {
            // delete the old invites
            snap.ref["delete"]();
          }));

        case 9:
          if (!(snapData.email !== snapData.email.toLowerCase())) {
            _context.next = 17;
            break;
          }

          // email is not lower case, force email to lower case
          console.log('emails are different'); // make email lower case

          snapData.email = snapData.email.toLowerCase(); // create new document

          newInvite = db.doc("/projects/".concat(context.params.projectId, "/invites/").concat(context.params.email.toLowerCase())); // create new batch operation

          batch = db.batch(); // delete the old document

          batch["delete"](snap.ref); // update new doc with email lower case

          batch.set(newInvite, snapData); // commit the batch and exit, the new doc will call this function again

          return _context.abrupt("return", batch.commit().then(function (res) {
            return true;
          })["catch"](function (err) {
            console.log(err);
          }));

        case 17:
          // [function ends here if email isn't lower case]
          // check if the email has been sent and send it if not
          if (!snapData.sent) {
            // email not sent
            // get the values to populate the email template
            project = snapData.projectName;
            email = snapData.email; // The email of the user.

            displayName = snapData.name; // The display name of the user.

            from = snapData.fromName;
            permission = snapData.permission; // send the email

            sendInviteEmail(email, displayName, project, from, permission); // mark the email as sent

            snapData.sent = true;
          } // check if the user exist (has logged in before), if yes add the project to their dashboard if not await login


          return _context.abrupt("return", db.collection('/users').where('email', '==', snapData.email).get().then(function (snap) {
            if (!snap.empty) {
              // user exists
              // get the user's uid
              for (var key in snap.docs) {
                var uid = snap.docs[key].id;
                var batch = db.batch();
                var userData = snap.docs[key].data();
                batch.set(db.doc("/projects/".concat(context.params.projectId, "/contributors/").concat(uid)), {
                  uid: uid,
                  name: userData.name,
                  email: userData.email,
                  photoURL: userData.photURL,
                  permission: snapData.permission,
                  budgets: snapData.budgets.isArray() || snapData.budgets === 'all' ? snapData.budgets : [snapData.budgets]
                });
                batch["delete"](snap.ref);
                return batch.commit().then(function (res) {
                  return true;
                })["catch"](function (err) {
                  console.log(err);
                });
              }
            }
          })["catch"](function (err) {
            console.log(err);
          }));

        case 19:
        case "end":
          return _context.stop();
      }
    }
  });
}); // Listen for user sign in

exports.onUserFirstSignIn = functions.auth.user().onCreate(function (user) {
  // console.log(user.uid)/
  // sanitise user
  console.log(user);
  var userSanitized = {};
  userSanitized.name = user.displayName;
  userSanitized.email = user.email;
  userSanitized.photoURL = user.photoURL; // userSanitized.projects = []
  // create a doc for the user

  var docRef = db.collection('/users').doc(user.uid);
  return docRef.get().then(function (doc) {
    // create a batch operation
    var batch = db.batch(); // check the user doesn't exist

    if (!doc.exists) {
      console.log('Creating User Doc'); // add the user data to the user doc

      batch.set(db.collection('/users').doc(user.uid), userSanitized);
      return db.collectionGroup('invites').where('email', '==', userSanitized.email).get().then(function (invitesSnap) {
        invitesSnap.forEach(function (inviteSnap) {
          console.log(inviteSnap.data()); // add the user to the projects they have been invited too

          batch.set(inviteSnap.ref.parent.parent.collection('/contributors').doc("/".concat(user.uid)), {
            uid: user.uid,
            email: userSanitized.email,
            name: userSanitized.name,
            permission: inviteSnap.data().permission,
            budgets: inviteSnap.data().budgets,
            photoURL: userSanitized.photoURL
          }); // delete the old invites

          batch["delete"](inviteSnap.ref);
        }); // commit the batch and exit

        return batch.commit().then(function (res) {
          return true;
        })["catch"](function (err) {
          console.log(err);
        });
      });
    }
  });
});
exports.userUpdated = functions.firestore.document('/users/{uid}').onUpdate(function (change, context) {
  console.log(context);
  var beforeData = change.before.data();
  var afterData = change.after.data();

  if (beforeData.name !== afterData.name || beforeData.photoURL !== afterData.photoURL) {
    db.collectionGroup("contributors").where('uid', '==', context.params.uid).get().then(function (query) {
      // update each contributor
      query.forEach(function (snap) {
        console.log('update contributors', {
          name: afterData.name,
          photoURL: afterData.photoURL
        });
        snap.ref.update({
          name: afterData.name,
          photoURL: afterData.photoURL
        });
      });
    });
    db.collectionGroup("transactions").where('submittedBy.uid', '==', context.params.uid).get().then(function (query) {
      // update each contributor
      query.forEach(function (snap) {
        console.log('update transactions', {
          'submittedBy.displayName': afterData.name,
          'submittedBy.photoURL': afterData.photoURL
        });
        snap.ref.update({
          'submittedBy.displayName': afterData.name,
          'submittedBy.photoURL': afterData.photoURL
        });
      });
    }); // userSnap.ref.update({name:beforeData.displayName,email:beforeData.email,photoURL:beforeData.photoURL})
  }

  return true;
});
exports.getReceipt = functions.https.onRequest(function _callee3(req, res) {
  var idToken, decodedIdToken, projectId;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          if (!((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) && !(req.cookies && req.cookies.__session))) {
            _context3.next = 4;
            break;
          }

          console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.', 'Make sure you authorize your request by providing the following HTTP header:', 'Authorization: Bearer <Firebase ID Token>', 'or by passing a "__session" cookie.');
          res.status(403).send('Unauthorized');
          return _context3.abrupt("return");

        case 4:
          if (!(req.headers.authorization && req.headers.authorization.startsWith('Bearer '))) {
            _context3.next = 9;
            break;
          }

          console.log('Found "Authorization" header'); // Read the ID Token from the Authorization header.

          idToken = req.headers.authorization.split('Bearer ')[1];
          _context3.next = 16;
          break;

        case 9:
          if (!req.cookies) {
            _context3.next = 14;
            break;
          }

          console.log('Found "__session" cookie'); // Read the ID Token from cookie.

          idToken = req.cookies.__session;
          _context3.next = 16;
          break;

        case 14:
          // No cookie
          res.status(403).send('Unauthorized');
          return _context3.abrupt("return");

        case 16:
          _context3.prev = 16;
          _context3.next = 19;
          return regeneratorRuntime.awrap(admin.auth().verifyIdToken(idToken));

        case 19:
          decodedIdToken = _context3.sent;
          console.log('ID Token correctly decoded', decodedIdToken);
          req.user = decodedIdToken; // next();
          // return;

          _context3.next = 29;
          break;

        case 24:
          _context3.prev = 24;
          _context3.t0 = _context3["catch"](16);
          console.error('Error while verifying Firebase ID token:', _context3.t0);
          res.status(403).send('Unauthorized');
          return _context3.abrupt("return");

        case 29:
          // user is authorised
          console.log(req.user, req.query);
          projectId = req.query.projectId;
          db.doc("/projects/".concat(projectId, "/contributors/").concat(req.user.user_id)).get().then(function _callee2(snap) {
            var id, storage, storageRef, file, exists, exists2, result, d, date, config, url;
            return regeneratorRuntime.async(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    if (!snap.exists) {
                      _context2.next = 47;
                      break;
                    }

                    id = req.query.id;
                    console.log('user is a contributor', 'getting file', "/projects/".concat(projectId, "/receipts/").concat(projectId, "-").concat(id, ".jpg")); // console.log(fileName)

                    storage = admin.storage();
                    storageRef = storage.bucket();
                    file = storageRef.file("/projects/".concat(projectId, "/receipts/").concat(projectId, "-").concat(id, ".jpg"));
                    _context2.next = 8;
                    return regeneratorRuntime.awrap(file.exists());

                  case 8:
                    exists = _context2.sent;
                    console.log('File Exists?', exists[0]);

                    if (exists[0]) {
                      _context2.next = 36;
                      break;
                    }

                    console.log('file missing: ', 'checking processed folder ', "/processed/".concat(projectId, "-").concat(id, ".jpg"));
                    file = null;
                    file = storageRef.file("/processed/".concat(projectId, "-").concat(id, ".jpg"));
                    console.log(file);
                    _context2.next = 17;
                    return regeneratorRuntime.awrap(file.exists());

                  case 17:
                    exists2 = _context2.sent;
                    console.log(exists2);

                    if (exists2[0]) {
                      _context2.next = 22;
                      break;
                    }

                    res.status(404).send("File doesn't exist");
                    return _context2.abrupt("return", false);

                  case 22:
                    _context2.t0 = console;
                    _context2.next = 25;
                    return regeneratorRuntime.awrap(file.exists());

                  case 25:
                    _context2.t1 = _context2.sent;
                    _context2.t2 = "moving to: /projects/".concat(projectId, "/receipts/").concat(projectId, "-").concat(id, ".jpg");

                    _context2.t0.log.call(_context2.t0, 'file found', _context2.t1, _context2.t2);

                    _context2.next = 30;
                    return regeneratorRuntime.awrap(file.copy("/projects/".concat(projectId, "/receipts/").concat(projectId, "-").concat(id, ".jpg"))["catch"](function (err) {
                      console.error('Error #6', err);
                      return err;
                    }));

                  case 30:
                    result = _context2.sent;
                    console.log('File Copied', result);
                    _context2.next = 34;
                    return regeneratorRuntime.awrap(file["delete"]()["catch"](function (err) {
                      console.error('Error #7', err);
                      return err;
                    }));

                  case 34:
                    console.log('Old File deleted');
                    file = result[0];

                  case 36:
                    d = new Date();
                    date = d.setHours(d.getHours() + 1); //   metadata.users[req.user.user_id] = date
                    // }
                    // await file.setMetadata(metadata)

                    config = {
                      action: 'read',
                      expires: date
                    };
                    console.log('Getting URL', config);
                    _context2.next = 42;
                    return regeneratorRuntime.awrap(file.getSignedUrl(config));

                  case 42:
                    url = _context2.sent;
                    console.log(url[0]);
                    res.status(200).send(url[0]); // let file = gcs.bucket('my-bucket').file('Capture.PNG');
                    // let readStream = file.createReadStream();
                    // res.status(200).setHeader("content-type", "image/jpeg");
                    // readStream.pipe(res);

                    _context2.next = 48;
                    break;

                  case 47:
                    res.status(403).send('Unauthorized');

                  case 48:
                  case "end":
                    return _context2.stop();
                }
              }
            });
          }); // res.status(200).sendFile('https://firebasestorage.googleapis.com/v0/b/sp-finance.appspot.com/o/projects%2FprojectId%2Freceipts%2FCapture.PNG?alt=media&token=b3a900c6-5ace-4270-a6a3-1142666a4c58')

        case 32:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[16, 24]]);
});
exports.receiptUploaded = functions.storage.bucket().object().onFinalize(function _callee4(object, context) {
  var fileBucket, filePath, gsFilePath, fileName, contentType, metageneration, metadata, bucket, tempFilePath, baseFileName, fileDir, tempLocalFile, JPEGFilePath, tempLocalJPEGFile, file;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          fileBucket = object.bucket; // The Storage bucket that contains the file.

          filePath = object.name; // File path in the bucket.

          gsFilePath = "gs://".concat(fileBucket, "/").concat(filePath);

          if (!(filePath === 'uploads/undefined-undefined.jpg')) {
            _context4.next = 5;
            break;
          }

          return _context4.abrupt("return", false);

        case 5:
          if (!(filePath.substring(0, filePath.lastIndexOf('/')) === 'uploads')) {
            _context4.next = 46;
            break;
          }

          console.log('file name: ', filePath, object.metadata);
          fileName = filePath.replace(/^.*[\\\/]/, '');
          contentType = object.contentType; // File content type.

          metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.

          metadata = object.metadata ? object.metadata : {}; // let metadata = object.metadata

          console.log(metadata);

          if (!metadata.processed) {
            _context4.next = 16;
            break;
          }

          if (!(metadata.processed === true)) {
            _context4.next = 16;
            break;
          }

          console.log('Already processed');
          return _context4.abrupt("return");

        case 16:
          if (contentType.startsWith('image/')) {
            _context4.next = 18;
            break;
          }

          return _context4.abrupt("return", console.log('This is not an image.'));

        case 18:
          // Download file from bucket.
          bucket = admin.storage().bucket(fileBucket);
          tempFilePath = path.join(os.tmpdir(), fileName);
          baseFileName = path.basename(filePath, path.extname(filePath));
          fileDir = path.dirname(filePath);
          tempLocalFile = path.join(os.tmpdir(), baseFileName); // let doc = db.collection(`/projects/${metadata.projectId}/transactions/`).doc()

          JPEGFilePath = path.normalize(path.format({
            dir: "/processed",
            name: "".concat(metadata.projectId, "-").concat(metadata.transId),
            ext: JPEG_EXTENSION
          }));
          tempLocalJPEGFile = path.join(os.tmpdir(), baseFileName.replace(/\.[^/.]+$/, '')); // const metadata = {
          //   contentType: contentType,
          //   users: {}
          // };

          file = bucket.file(filePath); // await file.download({destination: tempFilePath});
          // let oldMetadata = await file.getMetadata()
          // metadata.user = {}

          console.log('Downloading file');
          _context4.next = 29;
          return regeneratorRuntime.awrap(file.download({
            destination: tempLocalFile
          })["catch"](function (err) {
            console.error('Error #1', err);
            return err;
          }));

        case 29:
          console.log('The file has been downloaded to', tempLocalFile); // --------------------------- Convert the image to jpg ---------------------------- //

          if (object.contentType.startsWith('image/jpeg')) {
            _context4.next = 36;
            break;
          }

          _context4.next = 33;
          return regeneratorRuntime.awrap(spawn('convert', [tempLocalFile, tempLocalJPEGFile]));

        case 33:
          console.log('JPEG image created at', tempLocalJPEGFile);
          _context4.next = 38;
          break;

        case 36:
          console.log('Already a JPEG.');
          tempLocalJPEGFile = tempLocalFile;

        case 38:
          // -------------------------------- Uploading the JPEG image. -------------------------//
          console.log('Upload Image');
          metadata.contentType = 'image/jpeg';
          metadata.processed = true;
          console.log(metadata, {
            destination: JPEGFilePath,
            metadata: metadata
          });
          _context4.next = 44;
          return regeneratorRuntime.awrap(bucket.upload(tempLocalJPEGFile, {
            destination: JPEGFilePath,
            metadata: metadata
          }).then(function () {// console.log('Creating Transaction Doc ', metadata)
            // doc.set(metadata)
            //   .catch(err => {
            //     console.error('Error #3', err)
            //     return err
            //   })
          }) // await file.copy(admin.storage().bucket().file(`/projects/${metadata.projectId}/receipts/${doc.id}.jpg`))
          ["catch"](function (err) {
            console.error('Error #4', err);
            return err;
          }));

        case 44:
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
          file["delete"]();
          return _context4.abrupt("return", true);

        case 46:
        case "end":
          return _context4.stop();
      }
    }
  });
}); // Blurs the given file using ImageMagick, and uploads it to another bucket.

var blurImage = function blurImage(file, blurredBucketName) {
  var tempLocalPath, blurredBucket, gcsPath, unlink;
  return regeneratorRuntime.async(function blurImage$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          tempLocalPath = "/tmp/".concat(path.parse(file.name).base); // Download file from bucket.

          _context5.prev = 1;
          _context5.next = 4;
          return regeneratorRuntime.awrap(file.download({
            destination: tempLocalPath
          }));

        case 4:
          console.log("Downloaded ".concat(file.name, " to ").concat(tempLocalPath, "."));
          _context5.next = 10;
          break;

        case 7:
          _context5.prev = 7;
          _context5.t0 = _context5["catch"](1);
          throw new Error("File download failed: ".concat(_context5.t0));

        case 10:
          _context5.next = 12;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            gm(tempLocalPath).blur(0, 16).write(tempLocalPath, function (err, stdout) {
              if (err) {
                console.error('Failed to blur image.', err);
                reject(err);
              } else {
                console.log("Blurred image: ".concat(file.name));
                resolve(stdout);
              }
            });
          }));

        case 12:
          // Upload result to a different bucket, to avoid re-triggering this function.
          blurredBucket = storage.bucket(blurredBucketName); // Upload the Blurred image back into the bucket.

          gcsPath = "gs://".concat(blurredBucketName, "/").concat(file.name);
          _context5.prev = 14;
          _context5.next = 17;
          return regeneratorRuntime.awrap(blurredBucket.upload(tempLocalPath, {
            destination: file.name
          }));

        case 17:
          console.log("Uploaded blurred image to: ".concat(gcsPath));
          _context5.next = 23;
          break;

        case 20:
          _context5.prev = 20;
          _context5.t1 = _context5["catch"](14);
          throw new Error("Unable to upload blurred image to ".concat(gcsPath, ": ").concat(_context5.t1));

        case 23:
          // Delete the temporary file.
          unlink = promisify(fs.unlink);
          return _context5.abrupt("return", unlink(tempLocalPath));

        case 25:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[1, 7], [14, 20]]);
};

function detectText(bucketName, filename) {
  var text, _ref2, _ref3, detections, annotation;

  return regeneratorRuntime.async(function detectText$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          console.log("Looking for text in image gs://".concat(bucketName, "/").concat(filename));
          _context6.next = 3;
          return regeneratorRuntime.awrap(vision.textDetection("gs://".concat(bucketName, "/").concat(filename)));

        case 3:
          _ref2 = _context6.sent;
          _ref3 = _slicedToArray(_ref2, 1);
          detections = _ref3[0];
          annotation = detections.textAnnotations[0];
          text = annotation ? annotation.description : '';
          console.log("Extracted text from image (".concat(text.length, " chars)"));
          return _context6.abrupt("return", annotation);

        case 10:
        case "end":
          return _context6.stop();
      }
    }
  });
} // async function detectLogo(bucketName, filename) {
//   let text;
//   console.log(`Looking for text in image gs://${bucketName}/${filename}`);
//   let [detections] = await vision.logoDetection(`gs://${bucketName}/${filename}`)
//   const annotation = detections.logoAnnotations[0];
//   let logos = annotation ? annotation.description : '';
//   console.log(`Logo detection`, logos);
//   return logos;
// }


exports.onTransactionDelete = functions.firestore.document('/projects/{projectId}/transactions/{transId}').onDelete(function (snap, context) {
  // deletes the reciept on transaction delete
  var projectId = context.params.projectId;
  var transId = context.params.transId;
  var bucket = admin.storage().bucket();
  return bucket.file("/projects/".concat(projectId, "/receipts/").concat(transId, ".jpg"))["delete"]();
});
exports.onTransactionCreate = functions.firestore.document('/projects/{projectId}/transactions/{transId}').onCreate(function _callee5(snap, context) {
  var projectId, transId, snapdata, file, res, newFile;
  return regeneratorRuntime.async(function _callee5$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          // on transaction create get the receipt and rename and move it to the appropriate location
          projectId = context.params.projectId;
          transId = context.params.transId;
          snapdata = snap.data();
          console.log('Project', projectId, 'Transaction', transId);

          if (!(snapdata.receipt === true)) {
            _context7.next = 25;
            break;
          }

          console.log('Receipt uploaded'); // Move reciept image from uploads to receipts bucket

          _context7.next = 8;
          return regeneratorRuntime.awrap(admin.storage().bucket().file("/processed/".concat(projectId, "-").concat(transId, ".jpg")));

        case 8:
          file = _context7.sent;
          _context7.t0 = console;
          _context7.next = 12;
          return regeneratorRuntime.awrap(file.exists());

        case 12:
          _context7.t1 = _context7.sent;
          _context7.t2 = "moving to: /projects/".concat(projectId, "/receipts/").concat(projectId, "-").concat(transId, ".jpg");

          _context7.t0.log.call(_context7.t0, 'file found', _context7.t1, _context7.t2);

          _context7.next = 17;
          return regeneratorRuntime.awrap(file.copy("/projects/".concat(projectId, "/receipts/").concat(projectId, "-").concat(transId, ".jpg"))["catch"](function (err) {
            console.error('Error #6', err);
            return err;
          }));

        case 17:
          res = _context7.sent;
          console.log('File Copied', res);
          newFile = res[0];
          _context7.next = 22;
          return regeneratorRuntime.awrap(file["delete"]()["catch"](function (err) {
            console.error('Error #7', err);
            return err;
          }));

        case 22:
          console.log('Old File deleted');
          _context7.next = 26;
          break;

        case 25:
          console.log('No receipt uploaded');

        case 26:
          return _context7.abrupt("return", true);

        case 27:
        case "end":
          return _context7.stop();
      }
    }
  });
}); // TODO: make this use optimistic locking

exports.onTransactionWrite = functions.firestore.document('/projects/{projectId}/transactions/{transId}').onWrite(function _callee6(change, context) {
  var projectId, transId, newDoc, oldDoc, budgets, budgetKey, budget, expenses, income, promises;
  return regeneratorRuntime.async(function _callee6$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          // Get an object with the current document value.
          projectId = context.params.projectId;
          transId = context.params.transId; // If the document does not exist, it has been deleted.

          newDoc = change.after.exists ? change.after.data() : null; // Get an object with the previous document value (for update or delete)

          oldDoc = change.before.exists ? change.before.data() : null;

          if (!(oldDoc !== null && newDoc !== null)) {
            _context8.next = 8;
            break;
          }

          if (!(newDoc.amount === oldDoc.amount && newDoc.to === oldDoc.to && newDoc.from === oldDoc.from && newDoc.budget === oldDoc.budget && newDoc.category === oldDoc.category && newDoc.deleted === oldDoc.deleted)) {
            _context8.next = 8;
            break;
          }

          console.log('no change detected');
          return _context8.abrupt("return", true);

        case 8:
          budgets = [];

          if (oldDoc === null) {
            // create
            // make a list of all the budgets to be updated
            if (newDoc.category === 'Expense' || newDoc.category === 'Income') {
              budgets.push(newDoc.budget);
            } else if (newDoc.category === 'Journal') {
              budgets.push(newDoc.to);
              budgets.push(newDoc.from);
            }
          } else if (oldDoc !== null && newDoc !== null) {
            // update
            // make a list of all the budgets to be updated
            if (oldDoc.category === 'Expense' || oldDoc.category === 'Income') {
              budgets.push(oldDoc.budget);
            } else if (oldDoc.category === 'Journal') {
              budgets.push(oldDoc.to);
              budgets.push(oldDoc.from);
            }

            if (newDoc.category === 'Expense' || newDoc.category === 'Income') {
              budgets.push(newDoc.budget);
            } else if (newDoc.category === 'Journal') {
              budgets.push(newDoc.to);
              budgets.push(newDoc.from);
            }
          } else {
            // delete
            // make a list of all the budgets to be updated
            if (oldDoc.category === 'Expense' || oldDoc.category === 'Income') {
              budgets.push(oldDoc.budget);
            } else if (oldDoc.category === 'Journal') {
              budgets.push(oldDoc.to);
              budgets.push(oldDoc.from);
            }
          }

          budgets = budgets.filter(function (val, index, self) {
            return self.indexOf(val) === index;
          });
          console.log('updating budgets: ', budgets); // loop through all the budgets to update each one

          _context8.t0 = regeneratorRuntime.keys(budgets);

        case 13:
          if ((_context8.t1 = _context8.t0()).done) {
            _context8.next = 23;
            break;
          }

          budgetKey = _context8.t1.value;
          budget = budgets[budgetKey];
          expenses = 0, income = 0; // get all the related transactions and update the expense totals

          promises = [db.collection("/projects/".concat(projectId, "/transactions/")).where('category', '==', 'Expense').where('budget', '==', budget).get().then(function (query) {
            query.forEach(function (docRef) {
              if (!docRef.get('deleted')) {
                expenses += parseFloat(docRef.get('amount'));
              }
            });
            return true;
          }), db.collection("/projects/".concat(projectId, "/transactions/")).where('category', '==', 'Journal').where('from', '==', budget).get().then(function (query) {
            query.forEach(function (docRef) {
              if (!docRef.get('deleted')) {
                expenses += parseFloat(docRef.get('amount'));
              }
            });
            return true;
          }), db.collection("/projects/".concat(projectId, "/transactions/")).where('category', '==', 'Income').where('budget', '==', budget).get().then(function (query) {
            query.forEach(function (docRef) {
              if (!docRef.get('deleted')) {
                income += parseFloat(docRef.get('amount'));
              }
            });
            return true;
          }), db.collection("/projects/".concat(projectId, "/transactions/")).where('category', '==', 'Journal').where('to', '==', budget).get().then(function (query) {
            query.forEach(function (docRef) {
              if (!docRef.get('deleted')) {
                income += parseFloat(docRef.get('amount'));
              }
            });
            return true;
          })];
          _context8.next = 20;
          return regeneratorRuntime.awrap(Promise.all(promises));

        case 20:
          db.doc("/projects/".concat(projectId, "/accounts/").concat(budget)).update({
            expenses: expenses,
            income: income
          });
          _context8.next = 13;
          break;

        case 23:
        case "end":
          return _context8.stop();
      }
    }
  });
}); // TODO: work out what this does

exports.onAccountWrite = functions.firestore.document('/projects/{projectId}/accounts/{accountId}').onWrite((0, _updateCatAmounts["default"])(context)); // doesn't work due to issue with max size of transfer, 10MB i think

exports.downloadReceiptsZip = functions.https.onRequest(function _callee8(req, res) {
  var idToken, decodedIdToken, projectId;
  return regeneratorRuntime.async(function _callee8$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          if (!((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) && !(req.cookies && req.cookies.__session))) {
            _context10.next = 4;
            break;
          }

          console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.', 'Make sure you authorize your request by providing the following HTTP header:', 'Authorization: Bearer <Firebase ID Token>', 'or by passing a "__session" cookie.');
          res.status(403).send('Unauthorized');
          return _context10.abrupt("return");

        case 4:
          if (!(req.headers.authorization && req.headers.authorization.startsWith('Bearer '))) {
            _context10.next = 9;
            break;
          }

          console.log('Found "Authorization" header'); // Read the ID Token from the Authorization header.

          idToken = req.headers.authorization.split('Bearer ')[1];
          _context10.next = 16;
          break;

        case 9:
          if (!req.cookies) {
            _context10.next = 14;
            break;
          }

          console.log('Found "__session" cookie'); // Read the ID Token from cookie.

          idToken = req.cookies.__session;
          _context10.next = 16;
          break;

        case 14:
          // No cookie
          res.status(403).send('Unauthorized');
          return _context10.abrupt("return");

        case 16:
          _context10.prev = 16;
          _context10.next = 19;
          return regeneratorRuntime.awrap(admin.auth().verifyIdToken(idToken));

        case 19:
          decodedIdToken = _context10.sent;
          console.log('ID Token correctly decoded');
          req.user = decodedIdToken; // next();
          // return;

          _context10.next = 29;
          break;

        case 24:
          _context10.prev = 24;
          _context10.t0 = _context10["catch"](16);
          console.error('Error while verifying Firebase ID token:', _context10.t0);
          res.status(403).send('Unauthorized');
          return _context10.abrupt("return");

        case 29:
          // user is authorised
          // console.log(req.user, req.query)
          projectId = req.query.projectId;
          db.doc("/projects/".concat(projectId, "/contributors/").concat(req.user.user_id)).get().then(function _callee7(snap) {
            var d, date, config, _ref4, _ref5, files, receipts, fileId, file, data;

            return regeneratorRuntime.async(function _callee7$(_context9) {
              while (1) {
                switch (_context9.prev = _context9.next) {
                  case 0:
                    if (!snap.exists) {
                      _context9.next = 24;
                      break;
                    }

                    d = new Date();
                    date = d.setHours(d.getHours() + 1);
                    config = {
                      action: 'read',
                      expires: date
                    }; // console.log(`projects/${req.query.projectId}/receipts/`)

                    _context9.next = 6;
                    return regeneratorRuntime.awrap(admin.storage().bucket().getFiles({
                      delimiter: '/',
                      prefix: "projects/".concat(req.query.projectId, "/receipts/") /// ${req.query.projectId}/receipts/`

                    })["catch"](function (err) {
                      console.error(err);
                    }));

                  case 6:
                    _ref4 = _context9.sent;
                    _ref5 = _slicedToArray(_ref4, 1);
                    files = _ref5[0];
                    receipts = {};
                    console.log('found: ' + files.length + ' files');
                    _context9.t0 = regeneratorRuntime.keys(files);

                  case 12:
                    if ((_context9.t1 = _context9.t0()).done) {
                      _context9.next = 21;
                      break;
                    }

                    fileId = _context9.t1.value;
                    file = files[fileId]; // TODO: change file name to just reciept id

                    _context9.next = 17;
                    return regeneratorRuntime.awrap(file.getSignedUrl(config)["catch"](function (err) {
                      console.error(err);
                    }));

                  case 17:
                    data = _context9.sent;
                    // const metadata = await file.getMetadata().catch(err => {
                    //   console.error(err)
                    // })
                    receipts[file.metadata.name] = data; // console.log(file.metadata)

                    _context9.next = 12;
                    break;

                  case 21:
                    res.status(200).send(receipts);
                    _context9.next = 25;
                    break;

                  case 24:
                    res.status(403).send('Unauthorized');

                  case 25:
                  case "end":
                    return _context9.stop();
                }
              }
            });
          });

        case 31:
        case "end":
          return _context10.stop();
      }
    }
  }, null, null, [[16, 24]]);
});
exports.downloadCSV = functions.https.onRequest(function _callee9(req, res) {
  var idToken, decodedIdToken, projectId, project, accounts, accountDocs, transactions, transArray, index;
  return regeneratorRuntime.async(function _callee9$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          if (!((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) && !(req.cookies && req.cookies.__session))) {
            _context11.next = 4;
            break;
          }

          console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.', 'Make sure you authorize your request by providing the following HTTP header:', 'Authorization: Bearer <Firebase ID Token>', 'or by passing a "__session" cookie.');
          res.status(403).send('Unauthorized');
          return _context11.abrupt("return");

        case 4:
          if (!(req.headers.authorization && req.headers.authorization.startsWith('Bearer '))) {
            _context11.next = 9;
            break;
          }

          console.log('Found "Authorization" header'); // Read the ID Token from the Authorization header.

          idToken = req.headers.authorization.split('Bearer ')[1];
          _context11.next = 16;
          break;

        case 9:
          if (!req.cookies) {
            _context11.next = 14;
            break;
          }

          console.log('Found "__session" cookie'); // Read the ID Token from cookie.

          idToken = req.cookies.__session;
          _context11.next = 16;
          break;

        case 14:
          // No cookie
          res.status(403).send('Unauthorized');
          return _context11.abrupt("return");

        case 16:
          _context11.prev = 16;
          _context11.next = 19;
          return regeneratorRuntime.awrap(admin.auth().verifyIdToken(idToken));

        case 19:
          decodedIdToken = _context11.sent;
          console.log('ID Token correctly decoded', decodedIdToken);
          req.user = decodedIdToken; // next();
          // return;

          _context11.next = 29;
          break;

        case 24:
          _context11.prev = 24;
          _context11.t0 = _context11["catch"](16);
          console.error('Error while verifying Firebase ID token:', _context11.t0);
          res.status(403).send('Unauthorized');
          return _context11.abrupt("return");

        case 29:
          projectId = req.query.projectId;
          console.log(projectId);
          console.log("/projects/".concat(projectId));
          _context11.next = 34;
          return regeneratorRuntime.awrap(db.doc("/projects/".concat(projectId)).get()["catch"](function (err) {
            console.log(err);
          }));

        case 34:
          project = _context11.sent;
          console.log("/projects/".concat(projectId, "/accounts"));
          _context11.next = 38;
          return regeneratorRuntime.awrap(db.collection("/projects/".concat(projectId, "/accounts")).get()["catch"](function (err) {
            console.log(err);
          }));

        case 38:
          accounts = _context11.sent;
          accountDocs = {};
          _context11.next = 42;
          return regeneratorRuntime.awrap(accounts.forEach(function (account) {
            accountDocs[account.id] = account.data();
          }));

        case 42:
          _context11.next = 44;
          return regeneratorRuntime.awrap(db.collection("/projects/".concat(projectId, "/transactions")).get()["catch"](function (err) {
            console.log(err);
          }));

        case 44:
          transactions = _context11.sent;
          // console.log(transactions)
          transArray = [['sp_code', 'trans_number', 'trans_international?', 'trans_aus_currency_amt', 'trans_aus_gst', 'trans_int_currency', 'trans_int_curreny_amt', 'trans_int_aud_equiv', 'trans_date', 'trans_type', 'trans_category', 'trans_cheque', 'trans_description', 'trans_deleted?']];
          index = 1;
          transactions.forEach(function (transaction) {
            var transData = transaction.data();

            if (transData.category === 'Expense') {
              var account = accountDocs[transData.budget];

              if (account.type !== 'account') {
                var categoryId = account.category;
                var categoryDoc = accountDocs[categoryId];
                transArray[index] = [project.get('number'), transaction.id, 0, // international transfer? 0 if no, 1? if yes
                transData.amount, transData.GST, '', // currency, blank if not international transfer
                '', // amount in international currency
                '', // equivalent amount in AUD
                transData.date, transData.type, categoryDoc.label, transData.cheque, transData.desc > '' ? transData.desc.replace(/,/g, '-') : '', transData.deleted === true ? 1 : 0];
                index++;
              } // else {
              //   transArray[index] = [project.get('number'), transaction.id, 0, transData.amount, transData.GST, '', '', '', transData.date, transData.type, account.label, transData.cheque, transData.desc, transData.deleted]
              //   index++
              // }

            } else if (transData.category === 'Journal') {
              // console.log(
              //   transData,
              //   accountDocs[transData.to].type,
              //   accountDocs[transData.from].type
              // )
              if (accountDocs[transData.to].type === 'account' && accountDocs[transData.from].type === 'account') {
                transArray[index] = [project.get('number'), transaction.id, 0, transData.from === 'pettyCash' ? -1 * parseFloat(transData.amount) : transData.amount, transData.GST, '', '', '', transData.date, transData.type, 'Petty Cash', transData.cheque, transData.desc > '' ? transData.desc.replace(/,/g, '-') : '', transData.deleted === true ? 1 : 0];
                index++;
              }
            }
          }); // console.log(transArray.map(e => e.join(',')).join('\n'))

          res.status(200).send(transArray.map(function (e) {
            return e.join(',');
          }).join('\n'));

        case 49:
        case "end":
          return _context11.stop();
      }
    }
  }, null, null, [[16, 24]]);
});
exports.createProject = functions.https.onCall(function _callee10(data, context) {
  var projectRef, accountsRef;
  return regeneratorRuntime.async(function _callee10$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          console.log(context.auth);
          projectRef = admin.firestore().collection("/projects").doc();
          _context12.next = 4;
          return regeneratorRuntime.awrap(projectRef.set({
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
          }));

        case 4:
          projectRef.collection('/contributors').doc(context.auth.uid).set({
            email: context.auth.token.email,
            name: context.auth.token.name,
            uid: context.auth.uid,
            permission: 'admin',
            photoUrl: context.auth.token.picture
          });
          accountsRef = projectRef.collection('/accounts');
          accountsRef.doc('debitCard').set({
            label: 'Debit Card',
            systemAccount: false,
            type: 'account',
            inHeader: true
          });
          accountsRef.doc('pettyCash').set({
            label: 'Petty Cash',
            systemAccount: false,
            type: 'account',
            inHeader: true
          });

        case 8:
        case "end":
          return _context12.stop();
      }
    }
  });
});

function invite(from, project) {
  return "<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:o=\"urn:schemas-microsoft-com:office:office\"><head><!-- NAME: SELL PRODUCTS --><!--[if gte mso 15]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]--><meta charset=\"UTF-8\"><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><style type=\"text/css\">p{margin:10px 0;padding:0;}table{border-collapse:collapse;}h1,h2,h3,h4,h5,h6{display:block;margin:0;padding:0;}img,a img{border:0;height:auto;outline:none;text-decoration:none;}body,#bodyTable,#bodyCell{height:100%;margin:0;padding:0;width:100%;}.mcnPreviewText{display:none !important;}#outlook a{padding:0;}img{-ms-interpolation-mode:bicubic;}table{mso-table-lspace:0pt;mso-table-rspace:0pt;}.ReadMsgBody{width:100%;}.ExternalClass{width:100%;}p,a,li,td,blockquote{mso-line-height-rule:exactly;}a[href^=tel],a[href^=sms]{color:inherit;cursor:default;text-decoration:none;}p,a,li,td,body,table,blockquote{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;}.ExternalClass,.ExternalClass p,.ExternalClass td,.ExternalClass div,.ExternalClass span,.ExternalClass font{line-height:100%;}a[x-apple-data-detectors]{color:inherit !important;text-decoration:none !important;font-size:inherit !important;font-family:inherit !important;font-weight:inherit !important;line-height:inherit !important;}.templateContainer{max-width:600px !important;}a.mcnButton{display:block;}.mcnImage,.mcnRetinaImage{vertical-align:bottom;}.mcnTextContent{word-break:break-word;}.mcnTextContent img{height:auto !important;}.mcnDividerBlock{table-layout:fixed !important;}h1{color:#222222;font-family:Helvetica;font-size:40px;font-style:normal;font-weight:bold;line-height:150%;letter-spacing:normal;text-align:center;}h2{color:#222222;font-family:Helvetica;font-size:34px;font-style:normal;font-weight:bold;line-height:150%;letter-spacing:normal;text-align:left;}h3{color:#444444;font-family:Helvetica;font-size:22px;font-style:normal;font-weight:bold;line-height:150%;letter-spacing:normal;text-align:left;}h4{color:#949494;font-family:Georgia;font-size:20px;font-style:italic;font-weight:normal;line-height:125%;letter-spacing:normal;text-align:left;}#templateHeader{background-color:#F7F7F7;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:45px;padding-bottom:45px;}.headerContainer{background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0;}.headerContainer .mcnTextContent,.headerContainer .mcnTextContent p{color:#757575;font-family:Helvetica;font-size:16px;line-height:150%;text-align:left;}.headerContainer .mcnTextContent a,.headerContainer .mcnTextContent p a{color:#007C89;font-weight:normal;text-decoration:underline;}#templateBody{background-color:#FFFFFF;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:36px;padding-bottom:45px;}.bodyContainer{background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0;}.bodyContainer .mcnTextContent,.bodyContainer .mcnTextContent p{color:#757575;font-family:Helvetica;font-size:16px;line-height:150%;text-align:left;}.bodyContainer .mcnTextContent a,.bodyContainer .mcnTextContent p a{color:#007C89;font-weight:normal;text-decoration:underline;}#templateFooter{background-color:#333333;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0px;padding-bottom:0px;}.footerContainer{background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0;}.footerContainer .mcnTextContent,.footerContainer .mcnTextContent p{color:#FFFFFF;font-family:Helvetica;font-size:12px;line-height:150%;text-align:center;}.footerContainer .mcnTextContent a,.footerContainer .mcnTextContent p a{color:#FFFFFF;font-weight:normal;text-decoration:underline;}@media only screen and (min-width:768px){.templateContainer{width:600px !important;}}@media only screen and (max-width: 480px){body,table,td,p,a,li,blockquote{-webkit-text-size-adjust:none !important;}}@media only screen and (max-width: 480px){body{width:100% !important;min-width:100% !important;}}@media only screen and (max-width: 480px){.mcnRetinaImage{max-width:100% !important;}}@media only screen and (max-width: 480px){.mcnImage{width:100% !important;}}@media only screen and (max-width: 480px){.mcnCartContainer,.mcnCaptionTopContent,.mcnRecContentContainer,.mcnCaptionBottomContent,.mcnTextContentContainer,.mcnBoxedTextContentContainer,.mcnImageGroupContentContainer,.mcnCaptionLeftTextContentContainer,.mcnCaptionRightTextContentContainer,.mcnCaptionLeftImageContentContainer,.mcnCaptionRightImageContentContainer,.mcnImageCardLeftTextContentContainer,.mcnImageCardRightTextContentContainer,.mcnImageCardLeftImageContentContainer,.mcnImageCardRightImageContentContainer{max-width:100% !important;width:100% !important;}}@media only screen and (max-width: 480px){.mcnBoxedTextContentContainer{min-width:100% !important;}}@media only screen and (max-width: 480px){.mcnImageGroupContent{padding:9px !important;}}@media only screen and (max-width: 480px){.mcnCaptionLeftContentOuter .mcnTextContent,.mcnCaptionRightContentOuter .mcnTextContent{padding-top:9px !important;}}@media only screen and (max-width: 480px){.mcnImageCardTopImageContent,.mcnCaptionBottomContent:last-child .mcnCaptionBottomImageContent,.mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent{padding-top:18px !important;}}@media only screen and (max-width: 480px){.mcnImageCardBottomImageContent{padding-bottom:9px !important;}}@media only screen and (max-width: 480px){.mcnImageGroupBlockInner{padding-top:0 !important;padding-bottom:0 !important;}}@media only screen and (max-width: 480px){.mcnImageGroupBlockOuter{padding-top:9px !important;padding-bottom:9px !important;}}@media only screen and (max-width: 480px){.mcnTextContent,.mcnBoxedTextContentColumn{padding-right:18px !important;padding-left:18px !important;}}@media only screen and (max-width: 480px){.mcnImageCardLeftImageContent,.mcnImageCardRightImageContent{padding-right:18px !important;padding-bottom:0 !important;padding-left:18px !important;}}@media only screen and (max-width: 480px){.mcpreview-image-uploader{display:none !important;width:100% !important;}}@media only screen and (max-width: 480px){h1{font-size:30px !important;line-height:125% !important;}}@media only screen and (max-width: 480px){h2{font-size:26px !important;line-height:125% !important;}}@media only screen and (max-width: 480px){h3{font-size:20px !important;line-height:150% !important;}}@media only screen and (max-width: 480px){h4{font-size:18px !important;line-height:150% !important;}}@media only screen and (max-width: 480px){.mcnBoxedTextContentContainer .mcnTextContent,.mcnBoxedTextContentContainer .mcnTextContent p{font-size:14px !important;line-height:150% !important;}}@media only screen and (max-width: 480px){.headerContainer .mcnTextContent,.headerContainer .mcnTextContent p{font-size:16px !important;line-height:150% !important;}}@media only screen and (max-width: 480px){.bodyContainer .mcnTextContent,.bodyContainer .mcnTextContent p{font-size:16px !important;line-height:150% !important;}}@media only screen and (max-width: 480px){.footerContainer .mcnTextContent,.footerContainer .mcnTextContent p{font-size:14px !important;line-height:150% !important;}}</style></head><body style=\"height: 100%;margin: 0;padding: 0;width: 100%;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\"><!----><center><table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" height=\"100%\" width=\"100%\" id=\"bodyTable\" style=\"border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;height: 100%;margin: 0;padding: 0;width: 100%;\"><tbody><tr><td align=\"center\" valign=\"top\" id=\"bodyCell\" style=\"mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;height: 100%;margin: 0;padding: 0;width: 100%;\"><!-- BEGIN TEMPLATE // --><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\"><tbody><tr><td align=\"center\" valign=\"top\" id=\"templateHeader\" data-template-container=\"\" style=\"background:#F7F7F7 none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: #000000;background-image: url('https://firebasestorage.googleapis.com/v0/b/sp-finance.appspot.com/o/assets%2Fherson-rodriguez-ueP3nDeqPLY-unsplash.jpg?alt=media&amp;token=34eac538-a272-4039-be17-c77a05c27da7');background-repeat: no-repeat;background-position: bottom;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 45px;padding-bottom: 45px;\"><!--[if (gte mso 9)|(IE)]><table align=\"center\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" width=\"600\" style=\"width:600px;\"><tr><td align=\"center\" valign=\"top\" width=\"600\" style=\"width:600px;\"><![endif]--><table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"templateContainer\" style=\"border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;max-width: 600px !important;\"><tbody><tr><td valign=\"top\" class=\"headerContainer\" style=\"background:transparent none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: transparent;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 0;padding-bottom: 0;\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"mcnImageBlock\" style=\"min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\"><tbody class=\"mcnImageBlockOuter\"><tr><td valign=\"top\" style=\"padding: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\" class=\"mcnImageBlockInner\"><table align=\"left\" width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"mcnImageContentContainer\" style=\"min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\"><tbody><tr><td class=\"mcnImageContent\" valign=\"top\" style=\"padding-right: 9px;padding-left: 9px;padding-top: 0;padding-bottom: 0;text-align: center;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\"></td></tr></tbody></table></td></tr></tbody></table><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"mcnTextBlock\" style=\"min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\"><tbody class=\"mcnTextBlockOuter\"><tr><td valign=\"top\" class=\"mcnTextBlockInner\" style=\"padding-top: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\"><!--[if mso]><table align=\"left\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" width=\"100%\" style=\"width:100%;\"><tr><![endif]--><!--[if mso]><td valign=\"top\" width=\"600\" style=\"width:600px;\"><![endif]--><table align=\"left\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width: 100%;min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\" width=\"100%\" class=\"mcnTextContentContainer\"><tbody><tr><td valign=\"top\" class=\"mcnTextContent\" style=\"padding-top: 0;padding-right: 18px;padding-bottom: 9px;padding-left: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;word-break: break-word;color: #757575;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;\"><h1 style=\"display: block;margin: 0;padding: 0;color: #222222;font-family: Helvetica;font-size: 40px;font-style: normal;font-weight: bold;line-height: 150%;letter-spacing: normal;text-align: center;\">You have been invited to Summer Projects Finance</h1></td></tr></tbody></table><!--[if mso]></td><![endif]--><!--[if mso]></tr></table><![endif]--></td></tr></tbody></table></td></tr></tbody></table><!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]--></td></tr><tr><td align=\"center\" valign=\"top\" id=\"templateBody\" data-template-container=\"\" style=\"background:#FFFFFF none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: #FFFFFF;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 36px;padding-bottom: 45px;\"><!--[if (gte mso 9)|(IE)]><table align=\"center\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" width=\"600\" style=\"width:600px;\"><tr><td align=\"center\" valign=\"top\" width=\"600\" style=\"width:600px;\"><![endif]--><table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"templateContainer\" style=\"border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;max-width: 600px !important;\"><tbody><tr><td valign=\"top\" class=\"bodyContainer\" style=\"background:transparent none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: transparent;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 0;padding-bottom: 0;\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"mcnTextBlock\" style=\"min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\"><tbody class=\"mcnTextBlockOuter\"><tr><td valign=\"top\" class=\"mcnTextBlockInner\" style=\"padding-top: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\"><!--[if mso]><table align=\"left\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" width=\"100%\" style=\"width:100%;\"><tr><![endif]--><!--[if mso]><td valign=\"top\" width=\"600\" style=\"width:600px;\"><![endif]--><table align=\"left\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width: 100%;min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\" width=\"100%\" class=\"mcnTextContentContainer\"><tbody><tr><td valign=\"top\" class=\"mcnTextContent\" style=\"padding-top: 0;padding-right: 18px;padding-bottom: 9px;padding-left: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;word-break: break-word;color: #757575;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;\"><h3 style=\"text-align: center;display: block;margin: 0;padding: 0;color: #444444;font-family: Helvetica;font-size: 22px;font-style: normal;font-weight: bold;line-height: 150%;letter-spacing: normal;\">".concat(from, " has invited you to contribute to the ").concat(project, " project on the Summer Project Finance App.</h3></td></tr></tbody></table><!--[if mso]></td><![endif]--><!--[if mso]></tr></table><![endif]--></td></tr></tbody></table>\n<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"mcnButtonBlock\" style=\"min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\"><tbody class=\"mcnButtonBlockOuter\"><tr><td style=\"padding-top: 0;padding-right: 18px;padding-bottom: 18px;padding-left: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\" valign=\"top\" align=\"center\" class=\"mcnButtonBlockInner\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"mcnButtonContentContainer\" style=\"border-collapse: separate !important;border-radius: 3px;background-color: #26a69a;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\"><tbody><tr><td align=\"center\" valign=\"middle\" class=\"mcnButtonContent\" style=\"font-family: Helvetica;font-size: 18px;padding: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\"><a class=\"mcnButton \" title=\"Get Started\" href=\"https://sp-finance.web.app\" target=\"_blank\" style=\"font-weight: bold;letter-spacing: -0.5px;line-height: 100%;text-align: center;text-decoration: none;color: #FFFFFF;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;display: block;\">Get Started</a></td></tr></tbody></table></td></tr></tbody></table><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"mcnTextBlock\" style=\"min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\"><tbody class=\"mcnTextBlockOuter\"><tr><td valign=\"top\" class=\"mcnTextBlockInner\" style=\"padding-top: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\"><!--[if mso]><table align=\"left\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" width=\"100%\" style=\"width:100%;\"><tr><![endif]--><!--[if mso]><td valign=\"top\" width=\"600\" style=\"width:600px;\"><![endif]--><table align=\"left\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width: 100%;min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\" width=\"100%\" class=\"mcnTextContentContainer\"><tbody><tr><td valign=\"top\" class=\"mcnTextContent\" style=\"padding-top: 0;padding-right: 18px;padding-bottom: 9px;padding-left: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;word-break: break-word;color: #757575;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;\"><h6 style=\"text-align: center;display: block;margin: 0;padding: 0;color: #444444;font-family: Helvetica;font-size: 16px;font-style: normal;font-weight: normal;line-height: 150%;letter-spacing: normal;\">The Summer Projects Finance App is used to keep track of all of the receipts and transactions on a Power to Change Summer Project. \nIf you are a student you will be provided with a form that will allow you to upload receipts and other transactions that you make. Please check with your finance person or project leaders if you have any questions.\n</h6></td></tr></tbody></table><!--[if mso]></td><![endif]--><!--[if mso]></tr></table><![endif]--></td></tr></tbody></table>\n<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"mcnDividerBlock\" style=\"min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;table-layout: fixed !important;\"><tbody class=\"mcnDividerBlockOuter\"><tr><td class=\"mcnDividerBlockInner\" style=\"min-width: 100%;padding: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\"><table class=\"mcnDividerContent\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\"><tbody><tr><td style=\"mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;\"><span></span></td></tr></tbody></table><!--<td class=\"mcnDividerBlockInner\" style=\"padding: 18px;\"><hr class=\"mcnDividerContent\" style=\"border-bottom-color:none; border-left-color:none; border-right-color:none; border-bottom-width:0; border-left-width:0; border-right-width:0; margin-top:0; margin-right:0; margin-bottom:0; margin-left:0;\" />--></td></tr></tbody></table></td></tr></tbody></table><!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]--></td></tr><tr><td align=\"center\" valign=\"top\" id=\"templateFooter\" data-template-container=\"\" style=\"background:#333333 none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: #333333;background-image: 'https://firebasestorage.googleapis.com/v0/b/sp-finance.appspot.com/o/assets%2Fherson-rodriguez-ueP3nDeqPLY-unsplash.jpg?alt=media&amp;token=34eac538-a272-4039-be17-c77a05c27da7';background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 0px;padding-bottom: 0px;\"><!--[if (gte mso 9)|(IE)]><table align=\"center\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" width=\"600\" style=\"width:600px;\"><tr><td align=\"center\" valign=\"top\" width=\"600\" style=\"width:600px;\"><![endif]--><table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"templateContainer\" style=\"border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;max-width: 600px !important;\"><tbody><tr><td valign=\"top\" class=\"footerContainer\" style=\"background:transparent none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: transparent;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 0;padding-bottom: 0;\"></td></tr></tbody></table><!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]--></td></tr></tbody></table><!-- // END TEMPLATE --></td></tr></tbody></table></center></body></html>"); // email content in HTML
}