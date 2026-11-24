import ExperienceComponent from '../components/Experience';
import { PageFrame } from '../layout/PageFrame';

const Experience = () => {
  return (
    <PageFrame
      eyebrow="Career"
      title="Experience"
      dek="Roles and impact in stored order, Continental Resources first."
    >
      <ExperienceComponent />
    </PageFrame>
  );
};

export default Experience;
