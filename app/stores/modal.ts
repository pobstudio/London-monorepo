import create from 'zustand';

type State = {
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (s: boolean) => void;
  toggleIsSearchModalOpen: () => void;
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (s: boolean) => void;
  toggleIsWalletModalOpen: () => void;
  isMenuModalOpen: boolean;
  setIsMenuModalOpen: (s: boolean) => void;
  toggleIsMenuModalOpen: () => void;
};

export const useModalStore = create<State>((set, get) => ({
  isSearchModalOpen: false,
  setIsSearchModalOpen: (s) => set({ isSearchModalOpen: s }),
  toggleIsSearchModalOpen: () =>
    set((s) => ({
      isSearchModalOpen: !s.isSearchModalOpen,
      isWalletModalOpen: false,
      isMenuModalOpen: false,
    })),
  isWalletModalOpen: false,
  setIsWalletModalOpen: (s) => set({ isWalletModalOpen: s }),
  toggleIsWalletModalOpen: () =>
    set((s) => ({
      isWalletModalOpen: !s.isWalletModalOpen,
      isSearchModalOpen: false,
      isMenuModalOpen: false,
    })),
  isMenuModalOpen: false,
  setIsMenuModalOpen: (s) => set({ isMenuModalOpen: s }),
  toggleIsMenuModalOpen: () =>
    set((s) => ({
      isMenuModalOpen: !s.isMenuModalOpen,
      isSearchModalOpen: false,
      isWalletModalOpen: false,
    })),
}));
