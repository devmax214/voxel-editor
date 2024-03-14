import React from 'react';
import ViewModeSwitcher from './ViewModeSwitcher';
import ImExportBar from './ImExportBar';
import PromptEditor from './PromptEditor';

const StatusBar = () => {
  return (
    <div className="fixed left-1/2 transform -translate-x-1/2 bottom-10 z-10 border border-black rounded-lg w-fit p-2 bg-white">
      <div className="flex gap-x-8">
        <ViewModeSwitcher />
        <PromptEditor />
        <ImExportBar />
      </div>
    </div>
  )
}

export default StatusBar;
