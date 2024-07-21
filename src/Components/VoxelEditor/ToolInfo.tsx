import React, { useEffect, useCallback } from "react";
import { Switch } from "@chakra-ui/react";
import { useBasicStore } from "@/store";

const ToolInfo = () => {
  const { removeMode, setRemoveMode, useNormalMap, setUseNormalMap } = useBasicStore();

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === "KeyF") {
      setRemoveMode(!removeMode);
    } else if (e.code === "KeyP") { // Assuming 'P' toggles the normal map
      setUseNormalMap(!useNormalMap);
    }
  }, [removeMode, setRemoveMode, useNormalMap, setUseNormalMap]);

  useEffect(() => {
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyUp]);

  return (
    <div className="fixed z-[5] w-40 h-60 right-4 top-24 rounded-lg border border-black p-2 bg-white">
      <p className="text-black">Editor Control</p>
      <div className="flex items-center gap-x-2 mt-2">
        <Switch onChange={e => setRemoveMode(e.target.checked)} isChecked={removeMode} />
        <p className="text-black">Voxel Remove</p>
      </div>
      <div className="flex items-center gap-x-2 mt-2">
        <Switch onChange={e => setUseNormalMap(e.target.checked)} isChecked={useNormalMap} />
        <p className="text-black">Show Normal</p>
      </div>
    </div>
  );
}

export default ToolInfo;
