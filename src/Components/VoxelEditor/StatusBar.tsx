'use client'

import React, { useEffect, useState } from "react";
import { useRadioGroup } from "@chakra-ui/radio";
import { Button, HStack, Input, Progress } from "@chakra-ui/react";
import RadioCard from "../Elements/Radio/RadioCard";
import usePLYLoader from "@/hooks/usePLYLoader";
import { PLYExporter } from "three/examples/jsm/exporters/PLYExporter";
import { useBasicStore, useThreeStore } from "@/store";
import { requestMesh, getStatusById } from "utils/apiCall";
import useMeshReqStatus from "@/hooks/useMeshReqStatus";

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
  const { viewMode } = useBasicStore();
  const { setVoxels, setMesh, mesh } = useThreeStore();

  const [voxelData, imMesh] = usePLYLoader(plyFile, voxelSize);

  useEffect(() => {
    setVoxels(voxelData);
    setMesh(imMesh);
  }, [voxelData, setVoxels, imMesh, setMesh]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length) {
      setPlyFile(files[0]);
    }
  };

  const handleExportMesh = () => {
    const exporter = new PLYExporter();
    if (mesh !== null) {
      exporter.parse(mesh, (result) => {
        const blob = new Blob([result], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'export.ply';
        a.click();
      }, { binary: true });
    } else {
      alert('No mesh data!');
    }
  }

  if (viewMode === 'voxel')
    return null;

  return (
    <div className="flex gap-x-2">
      <div className="relative">
        <input
          className="absolute w-full h-full opacity-0 z-10"
          type="file"
          accept=".ply"
          onChange={handleFileUpload}
          />
        <Button className="absolute uppercase z-0">import</Button>
      </div>
      <Button as={'div'} className="uppercase" onClick={handleExportMesh}>export</Button>
    </div>
  );
}

const PromptEditor = () => {
  const [reqId, setReqId] = useState<string| null>(null);
  const { setVoxels, setMesh } = useThreeStore();
  const [propmt, setPrompt] = useState<string>('');
  const [meshData, setMeshData] = useState(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const [voxelData, imMesh] = useMeshReqStatus(meshData, voxelSize);

  useEffect(() => {
    const savedId = window.localStorage.getItem('reqId');
    if (savedId) setReqId(savedId);
  }, []);

  useEffect(() => {
    setVoxels(voxelData);
    setMesh(imMesh);
  }, [voxelData, setVoxels, imMesh, setMesh]);

  useEffect(() => {    
    if (!reqId) return;

    const checkReq = async () => {
      const res = await getStatusById(reqId);
      if (res && (res.status === 'IN_QUEUE' || res.status === 'IN_PROGRESS')) {
        setTimer(setTimeout(checkReq, 3000));
      }
      else if (res && res.status === 'COMPLETED') {
        window.localStorage.removeItem('reqId');
        setReqId(null);
        setMeshData(res.output);
      }
    }
    
    checkReq();
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }, [reqId]);

  const handleGenerate = async () => {
    const res = await requestMesh(propmt);
    if (res) {
      window.localStorage.setItem('reqId', res.id);
      setReqId(res.id);
    }
  }

  return (
    <div className="flex gap-x-2 w-96">
      <Input placeholder="Propmt" value={propmt} onChange={e => setPrompt(e.target.value)} />
      <Button onClick={handleGenerate} disabled={propmt === ''}>Generate</Button>
    </div>
  );
}

export default StatusBar;