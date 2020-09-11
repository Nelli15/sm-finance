module.exports = ({ admin, environment }) => async (snap, context) => {
  const db = admin.firestore()
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
}
