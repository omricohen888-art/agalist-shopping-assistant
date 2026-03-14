import { Composition } from "remotion";
import { AgalistCommercial } from "./compositions/AgalistCommercial";

export const Root: React.FC = () => {
  return (
    <Composition
      id="AgalistCommercial"
      component={AgalistCommercial}
      durationInFrames={600}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{}}
    />
  );
};
