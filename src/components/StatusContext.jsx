import { createContext, useContext, useState, useCallback } from "react";
import Status from "./Status";

const StatusContext = createContext(null);

export function StatusProvider({ children }) {
  const [statusList, setStatusList] = useState([]);

  const showStatus = useCallback((message, type = "success") => {
    const id = Date.now();
    setStatusList((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setStatusList((prev) => prev.filter((s) => s.id !== id));
    }, 5000);
  }, []);

  const closeStatus = (id) => {
    setStatusList((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <StatusContext.Provider value={{ showStatus }}>
      {children}

      <div className="fixed top-4 right-4 z-[2147483647] flex flex-col gap-2 pointer-events-none">
        {statusList.map((s) => (
          <div key={s.id} className="pointer-events-auto">
            <Status
              status={s.message}
              type={s.type}
              onClose={() => closeStatus(s.id)}
            />
          </div>
        ))}
      </div>
    </StatusContext.Provider>
  );
}

export function useStatus() {
  return useContext(StatusContext);
}