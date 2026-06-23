import React from 'react';
import type { H5PData } from '../../../types';
import { InteractiveVideo } from './h5p/InteractiveVideo';
import { BranchingScenario } from './h5p/BranchingScenario';
import { DragAndDrop } from './h5p/DragAndDrop';
import { FillInTheBlanks } from './h5p/FillInTheBlanks';
import { MarkTheWords } from './h5p/MarkTheWords';
import { CoursePresentation } from './h5p/CoursePresentation';
import { Quiz } from './h5p/Quiz';
import { Flashcards } from './h5p/Flashcards';
import { Timeline } from './h5p/Timeline';
import { Composite } from './h5p/Composite';

interface H5PNodeProps {
  data: H5PData;
  onComplete: (scorePercentage?: number) => void;
}

export const H5PNode: React.FC<H5PNodeProps> = ({ data, onComplete }) => {
  switch (data.type) {
    case 'InteractiveVideo':
      if (!data.interactiveVideo) return <div>Missing Interactive Video Data</div>;
      return <InteractiveVideo data={data.interactiveVideo} onComplete={onComplete} />;
    case 'BranchingScenario':
      if (!data.branchingScenario) return <div>Missing Branching Scenario Data</div>;
      return (
        <BranchingScenario 
          nodes={data.branchingScenario.nodes} 
          startNodeId={data.branchingScenario.startNodeId}
          onComplete={onComplete} 
        />
      );
    case 'DragAndDrop':
      if (!data.dragAndDrop) return <div>Missing Drag and Drop Data</div>;
      return <DragAndDrop data={data.dragAndDrop} onComplete={onComplete} />;
    case 'FillInTheBlanks':
      if (!data.fillInTheBlanks) return <div>Missing Fill in the Blanks Data</div>;
      return <FillInTheBlanks data={data.fillInTheBlanks} onComplete={onComplete} />;
    case 'MarkTheWords':
      if (!data.markTheWords) return <div>Missing Mark the Words Data</div>;
      return <MarkTheWords data={data.markTheWords} onComplete={onComplete} />;
    case 'CoursePresentation':
      if (!data.coursePresentation) return <div>Missing Course Presentation Data</div>;
      return <CoursePresentation data={data.coursePresentation} onComplete={onComplete} />;
    case 'Quiz':
      if (!data.quiz) return <div>Missing Quiz Data</div>;
      return <Quiz data={data.quiz} onComplete={onComplete} />;
    case 'Flashcards':
      if (!data.flashcards) return <div>Missing Flashcards Data</div>;
      return <Flashcards data={data.flashcards} onComplete={onComplete} />;
    case 'Timeline':
      if (!data.timeline) return <div>Missing Timeline Data</div>;
      return <Timeline data={data.timeline} onComplete={onComplete} />;
    case 'Composite':
      if (!data.composite) return <div>Missing Composite Data</div>;
      return <Composite data={data.composite} onComplete={onComplete} />;
    default:
      return <div>Unsupported H5P Type: {data.type}</div>;
  }
};
