import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'

    export const addContributorBudget = (projectId, budgets, uid) => {
      return updateDoc(
        doc(
          getFirestore(),
          `/projects/${projectId}/contributors/${uid}`
        ),
        { budgets }
      )
    }
    export const removeContributorBudget = (projectId, budgets, uid) => {
        return updateDoc(
          doc(
            getFirestore(),
            `/projects/${projectId}/contributors/${uid}`
          ),
          { budgets }
        )
    }
    export const updateInviteBudget = (projectId, budgets, email) => {
      return updateDoc(
        doc(
          getFirestore(),
          `/projects/${projectId}/invites/${email}`
        ),
        { budgets }
      )
    }
    export const addUser = (projectId, invite) => {
      // console.log(projectId, invite)
      return setDoc(
        doc(
          getFirestore(),
          `/projects/${projectId}/invites/${invite.email}`
        ),
        invite
      )
    }
    export const updateUser = ({projectId, uid, key, val}) => {
      return updateDoc(
        doc(
          getFirestore(),
          `/projects/${projectId}/contributors/${uid}`
        ),
        { [key]: val }
      )
    }
    export const updateInvite = ({projectId, email, key, val}) => {
      return updateDoc(
        doc(
          getFirestore(),
          `/projects/${projectId}/invites/${email}`
        ),
        { [key]: val }
      )
    }
    export const removeUser = (projectId, uid) => {
      return deleteDoc(
        doc(
          getFirestore(),
          `/projects/${projectId}/contributors/${uid}`
        )
      )
    }
    export const removeInvite = (projectId, email) => {
      return deleteDoc(
        doc(
          getFirestore(),
          `/projects/${projectId}/invites/${email}`
        )
      )
    }