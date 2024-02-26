import React, { useEffect, useState } from 'react';
import { useBasicStore } from '@/store';
import { Alert, useToast } from '@chakra-ui/react';

const InfoBox = () => {
  const [show, setShow] = useState<boolean>(false);
  const toast = useToast();
  const toastId = 'mesh'
  const { meshReqStatus, setMeshReqStatus } = useBasicStore();

  useEffect(() => {
    if (meshReqStatus === 'IN_QUEUE' || meshReqStatus === 'IN_PROGRESS') setShow(true);
    else if (meshReqStatus === 'COMPLETED') {
      setShow(false);
      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
          title: 'Completed',
          description: 'Voxel successfully generated',
          status:'success',
          duration: 5000,
          isClosable: true,
          variant: 'left-accent',
          position: 'top',
          containerStyle: {
            top: '120px'
          }
        });
        setMeshReqStatus('');
      }
    }
    else if (meshReqStatus === 'FAILED') {
      setShow(false);
      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
          title: 'Failed',
          description: 'Voxel generation failed',
          status: 'error',
          duration: 5000,
          isClosable: true,
          variant: 'left-accent',
          position: 'top',
          containerStyle: {
            top: '120px'
          }
        });
        setMeshReqStatus('');
      }
    }
  }, [meshReqStatus, setMeshReqStatus, toast]);

  if (!show) return null;

  return (
    <div className="fixed top-40 z-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Alert status='info' className="rounded-lg">
        <p>
          It takes around 30 sec to generate, wait patiently.
        </p>
      </Alert>
    </div>
  )
}

export default InfoBox
