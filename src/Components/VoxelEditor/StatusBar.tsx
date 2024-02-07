'use client'

import React, { useEffect, useState } from "react";
import { useRadioGroup } from "@chakra-ui/radio";
import { Button, HStack, Input, Progress } from "@chakra-ui/react";
import RadioCard from "../Elements/Radio/RadioCard";
import usePLYLoader from "@/hooks/usePLYLoader";
import { useBasicStore, useThreeStore } from "@/store";

const voxelSize = Number(process.env.NEXT_PUBLIC_VOXEL_SIZE);

const StatusBar = () => {
  return (
    <div className="absolute z-10 w-full bottom-10">
      <div className="z-10 mx-auto border border-black rounded-lg w-fit p-2 bg-white">
        <div className="flex gap-x-8">
          <ViewModeSwicher />
          <PromptEditor />
          <ImExportBar />
        </div>
        <ProgressBar />
      </div>
    </div>
  );
}

const ViewModeSwicher = () => {
  const options = ['voxel', 'mesh'];
  const { viewMode, setViewMode } = useBasicStore();

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'viewMode',
    defaultValue: viewMode,
    onChange: setViewMode,
  });

  const group = getRootProps();

  return (
    <HStack {...group}>
      {options.map((value: string) => {
        const radio = getRadioProps({ value });
        return (
          <RadioCard key={value} {...radio}>
            {value}
          </RadioCard>
        )
      })}
    </HStack>
  )
}

const ProgressBar = () => {
  return (
    <div className="flex items-center mt-2 gap-x-2">
      <div className="w-full">
        <Progress hasStripe value={50} />
      </div>
      <p className="text-black uppercase text-sm">time/progress</p>
    </div>
  )
}

const ImExportBar = () => {
  const [plyFile, setPlyFile] = useState<File | null>(null);
  const { setVoxels, setMesh } = useThreeStore();

  const [voxelData, mesh] = usePLYLoader(plyFile, voxelSize);

  useEffect(() => {
    setVoxels(voxelData);
    setMesh(mesh);
  }, [voxelData, setVoxels, mesh, setMesh]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length) {
      setPlyFile(files[0]);
    }
  };

  return (
    <div className="flex gap-x-2">
      <div className="relative">
        <input
          className="absolute w-full h-full opacity-0 z-10 cursor-pointer"
          type="file"
          accept=".ply"
          onChange={handleFileUpload}
          />
        <Button as={'div'} className="absolute uppercase z-0">import</Button>
      </div>
      <div className="relative">
        {/* <input className="absolute w-full h-full opacity-0 z-10 cursor-pointer" type="file" accept=".ply" /> */}
        <Button as={'div'} className="absolute uppercase z-0">export</Button>
      </div>
    </div>
  );
}

const PromptEditor = () => {
  return (
    <div className="flex gap-x-2">
      <Input placeholder="Propmt" />
      <Button>Generate</Button>
    </div>
  );
}

export default StatusBar;