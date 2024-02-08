import React from "react";
import { Switch } from "@chakra-ui/react";
import { useBasicStore } from "@/store";

const ToolInfo = () => {
  const { removeMode, setRemoveMode } = useBasicStore();

  return (
    <div className="fixed z-10 w-40 h-60 right-4 top-24 rounded-lg border border-black p-2 bg-white">
      <p className="text-black uppercase">ToolInfo</p>
      <div className="flex items-center gap-x-2 mt-2">
        <Switch onChange={e => setRemoveMode(e.target.checked)} checked={removeMode} />
        <p className="text-black capitalize">remove</p>
      </div>
    </div>
  );
}

export default ToolInfo;