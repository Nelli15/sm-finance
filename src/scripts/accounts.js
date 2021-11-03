import { getFirestore, updateDoc, doc, addDoc, collection } from 'firebase/firestore'

export function updateCategory(projectId, budgetId, key, val) {
    return updateDoc(
      doc(
        getFirestore(),
        `/projects/${projectId}/accounts/${budgetId}`
      ),
      { [key]: val }
    )
  }

    export function createAccount(projectId, val) {
    return addDoc(
      collection(
        getFirestore(),
        `/projects/${projectId}/accounts/`
      ),
      val
    )
  }

  export function updateAccount(projectId, accountId, key, val) {
    return updateDoc(
      doc(
        getFirestore(),
        `/projects/${projectId}/accounts/${accountId}`
      ),
      { [key]: val }
    )
  }

  export function updateBudgetByKey(projectId, budgetId, key, val) {
    return updateDoc(
      doc(
        getFirestore(),
        `/projects/${projectId}/accounts/${budgetId}`
      ),
      { [key]: val }
    )
  }
