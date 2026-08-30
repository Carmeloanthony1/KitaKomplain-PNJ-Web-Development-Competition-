import { createContext, useContext, useState, useCallback, useRef } from "react";
import ConfirmModal from "./ConfirmModal";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState(null);
  const resolveRef = useRef(null);

  const showConfirm = useCallback((message) => {
    setConfirmState({ message });
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    resolveRef.current?.(true);
    setConfirmState(null);
  };

  const handleCancel = () => {
    resolveRef.current?.(false);
    setConfirmState(null);
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      {confirmState && (
        <ConfirmModal
          message={confirmState.message}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}