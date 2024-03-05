'use client'

import React from "react";
import { Project } from "utils/types";

type ProjectContext = {
  projects: Project[],
  setProjects: (projects: Project[]) =>  void;
  addProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  updateProject: (projectId: string, projectData: Partial<Project>) => void;
}

export const ProjectContext = React.createContext<ProjectContext>({
  projects: [],
  setProjects: (projects: Project[]) => {},
  addProject: (project: Project) => {},
  deleteProject: (projectId: string) => {},
  updateProject: (projectId: string, projectData: Partial<Project>) => {},
});

export const useProjectContext = () => React.useContext(ProjectContext);

export const ProjectContextProvider = (props: React.PropsWithChildren) => {
  const [projects, setProjects] = React.useState<Project[]>([]);

  const addProject = (project: Project) => {
    setProjects([project, ...projects]);
  };

  const deleteProject = (projectId: string) => {
    setProjects(projects.filter(project => project.id !== projectId));
  }

  const updateProject = (projectId: string, projectData: Partial<Project>) => {
    setProjects(projects.map(project => project.id === projectId? {...project, ...projectData } : project));
  }

  return (
    <ProjectContext.Provider value={{ projects, setProjects, deleteProject, addProject, updateProject }}>
      {props.children}
    </ProjectContext.Provider>
  )
}