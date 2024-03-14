import React, { useState, useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { useParams } from 'next/navigation';
import { useProjectContext } from '@/contexts/projectContext';
import { useBasicStore } from '@/store';
import { ProjectStatus } from 'utils/types';

const ModelTip = () => {
  const [show, setShow] = useState<boolean>(false);
  const params = useParams();
  const projectId = params?.projectId as string;
  const { projects } = useProjectContext();
  const { viewMode } = useBasicStore();
  const current = projects.filter(project => project.id === projectId)[0];

  useEffect(() => {
    if (!current?.modelGenerated && current?.status !== ProjectStatus.MaterialGenerating) {
      setShow(true);
    }
    else setShow(false);
  }, [current]);

  if (!show || viewMode !== 'model') return null;

  return (
    <div className="fixed top-40 z-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Alert status='info' className="rounded-lg">
        <p>
          {'Click "Generate Model" to produce model.'}
        </p>
      </Alert>
    </div>
  )
}

export default ModelTip
