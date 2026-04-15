'use client'

import React, { Dispatch, SetStateAction } from 'react'
import { createContext } from 'react';
import useSignInModal from './sign-in-modal';

export const ModalContext = createContext<{
  setShowSignInModal: Dispatch<SetStateAction<boolean>>;
}>({
  setShowSignInModal: () => {},
})

const ModalProvider = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    const { setShowSignInModal, SignInModal } = useSignInModal()

  return (
    <ModalContext.Provider value={{ setShowSignInModal }}>
      <SignInModal />
      {children}
    </ModalContext.Provider>
  )
}

export default ModalProvider