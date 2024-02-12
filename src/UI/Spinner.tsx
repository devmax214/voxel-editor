import React from "react";
import { Spinner } from "@chakra-ui/react";

export const Loading = ({
  isLoading,
} : {
  isLoading: boolean,
}) => {
  if (!isLoading) return null;

  return (
    <div className="absolute w-full h-full flex justify-center items-center z-20">
      <Spinner
        thickness='5px'
        speed='0.8s'
        emptyColor='gray.200'
        color='blue.500'
        size='xl'
      />
    </div>
  );
}