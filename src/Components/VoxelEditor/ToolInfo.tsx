import React, { useEffect } from "react";
import { Switch } from "@chakra-ui/react";
import { useBasicStore } from "@/store";

const ToolInfo = () => {
  const { removeMode, setRemoveMode } = useBasicStore();

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyF") {
        setRemoveMode(!removeMode);
      }
    }
    
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [removeMode, setRemoveMode]);

  return (
    <div className="fixed z-10 w-40 h-60 right-4 top-24 rounded-lg border border-black p-2 bg-white">
      <p className="text-black uppercase">ToolInfo</p>
      <div className="flex items-center gap-x-2 mt-2">
        <Switch onChange={e => setRemoveMode(e.target.checked)} isChecked={removeMode} />
        <p className="text-black capitalize">remove</p>
      </div>
    </div>
  );
}

export default ToolInfo;