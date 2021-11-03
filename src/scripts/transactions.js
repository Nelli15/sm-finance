import { getFirestore, doc, updateDoc } from 'firebase/firestore'

  export function updateTransactionByKey(projectId, trans, key, val) {
    return updateDoc(
      doc(
        getFirestore(),
        `/projects/${projectId}/transactions/${trans}`
      ),
      { [key]: val }
    )
  }