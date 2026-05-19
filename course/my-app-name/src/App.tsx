import { courseName, courseParts } from '../courseData';
import type { CoursePart } from '../types';

const assertNever = (value: never): never => {
  throw new Error(
    `Unhandled discriminated union member: ${JSON.stringify(value)}`,
  );
};

type HeaderProps = {
  courseName: string;
};

const Header = ({ courseName }: HeaderProps) => {
  return <h1>{courseName}</h1>;
};

type ContentProps = {
  courseParts: CoursePart[];
};

type PartProps = {
  part: CoursePart;
};

const Part = ({ part }: PartProps) => {
  switch (part.kind) {
    case 'basic':
      return (
        <p>
          <b>
            {part.name} {part.exerciseCount}
          </b>
          <br />
          {part.description}
        </p>
      );
    case 'group':
      return (
        <p>
          <b>
            {part.name} {part.exerciseCount}
          </b>
          <br />
          project exercises {part.groupProjectCount}
        </p>
      );
    case 'background':
      return (
        <p>
          <b>
            {part.name} {part.exerciseCount}
          </b>
          <br />
          {part.description}
          <br />
          submit to {part.backgroundMaterial}
        </p>
      );
    case 'special':
      return (
        <p>
          <b>
            {part.name} {part.exerciseCount}
          </b>
          <br />
          {part.description}
          <br />
          required skills: {part.requirements.join(', ')}
        </p>
      );
    default:
      return assertNever(part);
  }
};

const Content = ({ courseParts }: ContentProps) => {
  return (
    <>
      {courseParts.map((part) => (
        <Part key={part.name} part={part} />
      ))}
    </>
  );
};

type TotalProps = {
  courseParts: CoursePart[];
};

const Total = ({ courseParts }: TotalProps) => {
  const totalExercises = courseParts.reduce(
    (sum, part) => sum + part.exerciseCount,
    0,
  );

  return <p>Number of exercises {totalExercises}</p>;
};

const App = () => {
  return (
    <div>
      <Header courseName={courseName} />
      <Content courseParts={courseParts} />
      <Total courseParts={courseParts} />
    </div>
  );
};

export default App;
