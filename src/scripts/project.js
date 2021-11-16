import { getFirestore, updateDoc, doc } from 'firebase/firestore'

  export function updateProject(projectId, fields) {
    return updateDoc(doc(getFirestore(), `/projects/${projectId}`), fields).then(() => true)
  }

  export function updateProjectByKey(projectId, key, val) {
    
    return updateDoc(doc(getFirestore(), `/projects/${projectId}`), {
      [key]: val
    })
  }
 export function updatePettyByKey(projectId, key, val) {
    return updateDoc(doc(getFirestore(), `/projects/${projectId}`), {
      [key]: parseInt(val)
    })
  }