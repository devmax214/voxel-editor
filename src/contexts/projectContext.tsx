'use client'

import React, { useCallback } from "react";
import { Project } from "utils/types";
import { getProjectsByUid } from '@/Firebase/dbactions'; // Ensure this import is correct
import { useAuthContext } from '@/contexts/authContext';

type ProjectContext = {
  projects: Project[],
  setProjects: (projects: Project[]) =>  void;
  addProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  updateProject: (projectId: string, projectData: Partial<Project>) => void;
  loadProjects: () => Promise<void>;
}

export const ProjectContext = React.createContext<ProjectContext>({
  projects: [],
  setProjects: (projects: Project[]) => {},
  addProject: (project: Project) => {},
  deleteProject: (projectId: string) => {},
  updateProject: (projectId: string, projectData: Partial<Project>) => {},
  loadProjects: async () => {},
});

export const useProjectContext = () => React.useContext(ProjectContext);

export const ProjectContextProvider = (props: React.PropsWithChildren) => {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const { user } = useAuthContext(); // Ensure this hook is available

  const addProject = (project: Project) => {
    setProjects([project, ...projects]);
  };

  const deleteProject = (projectId: string) => {
    setProjects(projects.filter(project => project.id !== projectId));
  }

  const updateProject = (projectId: string, projectData: Partial<Project>) => {
    setProjects(projects.map(project => project.id === projectId? { ...project, ...projectData } : project));
    console.log("updated");
  }

  const loadProjects = useCallback(async () => {
    if (!user) return;
    try {
      const projects = await getProjectsByUid(user.uid);
      setProjects(projects);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  }, [user]);

  return (
    <ProjectContext.Provider value={{ projects, setProjects, deleteProject, addProject, updateProject, loadProjects }}>
      {props.children}
    </ProjectContext.Provider>
  )
}