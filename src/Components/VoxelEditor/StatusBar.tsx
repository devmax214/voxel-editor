import React from "react";
import { useRadioGroup } from "@chakra-ui/radio";
import { Button, HStack, Input, Progress } from "@chakra-ui/react";
import RadioCard from "../Elements/Radio/RadioCard";

const StatusBar = () => {
  return (
    <div className="absolute z-10 w-full bottom-10">
      <div className="z-10 mx-auto border border-black rounded-lg w-fit p-2">
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

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'viewMode',
    defaultValue: 'voxel',
    onChange: console.log,
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
  return (
    <div className="flex gap-x-2">
      <Button className="uppercase">import</Button>
      <Button className="uppercase">export</Button>
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