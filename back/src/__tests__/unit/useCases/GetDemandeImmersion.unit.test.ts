import { DemandeImmersionEntityBuilder } from "../../../_testBuilders/DemandeImmersionEntityBuilder";
import { NotFoundError } from "../../../adapters/primary/helpers/sendHttpResponse";
import { InMemoryDemandeImmersionRepository } from "../../../adapters/secondary/InMemoryDemandeImmersionRepository";
import { expectPromiseToFailWithError } from "../../../_testBuilders/test.helpers";
import { GetDemandeImmersion } from "../../../domain/demandeImmersion/useCases/GetDemandeImmersion";

describe("Get DemandeImmersion", () => {
  let repository: InMemoryDemandeImmersionRepository;
  let getDemandeImmersion: GetDemandeImmersion;

  beforeEach(() => {
    repository = new InMemoryDemandeImmersionRepository();
    getDemandeImmersion = new GetDemandeImmersion({
      demandeImmersionRepository: repository,
    });
  });

  describe("When the DemandeImmersion does not exist", () => {
    it("throws NotFoundError", async () => {
      expectPromiseToFailWithError(
        getDemandeImmersion.execute({ id: "unknown_demande_immersion_id" }),
        new NotFoundError("unknown_demande_immersion_id")
      );
    });
  });

  describe("When a DemandeImmersion is stored", () => {
    it("returns the DemandeImmersion", async () => {
      const entity = new DemandeImmersionEntityBuilder().build();
      repository.setDemandesImmersion({ [entity.id]: entity });

      const demandeImmersion = await getDemandeImmersion.execute({
        id: entity.id,
      });
      expect(demandeImmersion).toEqual(entity.toDto());
    });
  });
});
