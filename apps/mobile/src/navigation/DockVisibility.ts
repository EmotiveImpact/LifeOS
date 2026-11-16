import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';
export const DockVisibility = createContext<Dispatch<SetStateAction<boolean>>>(() => {});
export const useDockVisibility = () => useContext(DockVisibility);
