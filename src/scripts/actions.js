import { getFirestore, doc, updateDoc, addDoc, collection } from 'firebase/firestore'

  export function updateAction(projectId, id, val) {
    return updateDoc(
      doc(
        getFirestore(),
        `/projects/${projectId}/actions/${id}`
      ),
      val
    ).then(() => {
      return id
    })
  }
  
    export function createAction(projectId, val) {
    return addDoc(
      collection(
        getFirestore(),
        `/projects/${projectId}/actions`
      ),
      val
    ).then(res => {
      return res.id
    })
  }