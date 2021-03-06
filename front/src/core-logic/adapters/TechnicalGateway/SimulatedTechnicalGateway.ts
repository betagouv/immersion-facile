import { Observable, of } from "rxjs";
import { AbsoluteUrl } from "shared/src/AbsoluteUrl";
import { FeatureFlags, makeStubFeatureFlags } from "shared/src/featureFlags";
import { TechnicalGateway } from "src/core-logic/ports/TechnicalGateway";

export class SimulatedTechnicalGateway implements TechnicalGateway {
  getAllFeatureFlags = (): Observable<FeatureFlags> =>
    of(makeStubFeatureFlags());

  // eslint-disable-next-line @typescript-eslint/require-await
  uploadFile = async (file: File): Promise<AbsoluteUrl> => {
    // eslint-disable-next-line no-console
    console.log("file uploaded : ", file);
    return `http://${file.name}-url`;
  };
}
