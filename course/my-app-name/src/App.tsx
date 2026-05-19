type CoursePart = {
  name: string;
  exerciseCount: number;
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

const Content = ({ courseParts }: ContentProps) => {
  return (
    <>
      {courseParts.map((part) => (
        <p key={part.name}>
          {part.name} {part.exerciseCount}
        </p>
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
  const courseName = 'Half Stack application development';
  const courseParts = [
    {
      name: 'Fundamentals',
      exerciseCount: 10,
    },
    {
      name: 'Using props to pass data',
      exerciseCount: 7,
    },
    {
      name: 'Deeper type usage',
      exerciseCount: 14,
    },
  ];

  return (
    <div>
      <Header courseName={courseName} />
      <Content courseParts={courseParts} />
      <Total courseParts={courseParts} />
    </div>
  );
};

export default App;
