import { AgencyId } from "shared/src/agency/agency.dto";
import {
  allConventionStatuses,
  ConventionDto,
  ConventionReadDto,
} from "shared/src/convention/convention.dto";
import { ConventionDtoBuilder } from "shared/src/convention/ConventionDtoBuilder";
import { createInMemoryUow } from "../../../adapters/primary/config/uowConfig";
import { InMemoryConventionRepository } from "../../../adapters/secondary/InMemoryConventionRepository";
import { InMemoryUowPerformer } from "../../../adapters/secondary/InMemoryUowPerformer";
import { ListAdminConventions } from "../../../domain/convention/useCases/ListAdminConventions";

const agencyIds: AgencyId[] = [
  "11111111-1111-1111-1111-111111111111",
  "22222222-2222-2222-2222-222222222222",
  "33333333-3333-3333-3333-333333333333",
];

describe("List Conventions", () => {
  let listConventions: ListAdminConventions;
  let conventionRepository: InMemoryConventionRepository;

  beforeEach(() => {
    const uow = createInMemoryUow();
    conventionRepository = uow.conventionRepository;
    listConventions = new ListAdminConventions(new InMemoryUowPerformer(uow));
  });

  describe("When the conventionRepository is empty", () => {
    it("returns empty list", async () => {
      const conventions = await listConventions.execute({
        status: undefined,
        agencyId: undefined,
      });
      expect(conventions).toEqual([]);
    });
  });

  describe("When a Convention is stored", () => {
    it("returns the Convention", async () => {
      const convention = new ConventionDtoBuilder().build();
      conventionRepository.setConventions({ form_id: convention });

      const listedAdminConventions = await listConventions.execute({
        status: undefined,
        agencyId: undefined,
      });
      const expectedAdminConvention: ConventionReadDto[] = [
        { ...convention, agencyName: "TEST_AGENCY_NAME" },
      ];
      expect(listedAdminConventions).toEqual(expectedAdminConvention);
    });
  });

  describe("filters", () => {
    let applicationCount = 0;

    // Populate the DB with 1 record of with all possible statuses and a set of agency ids.
    beforeEach(() => {
      const entities: ConventionDto[] = [];

      allConventionStatuses.forEach((status) => {
        agencyIds.forEach((agencyId) => {
          entities.push(
            new ConventionDtoBuilder()
              .withAgencyId(agencyId)
              .withStatus(status)
              .withId(`id-${applicationCount}`)
              .build(),
          );
          applicationCount++;
        });
      });

      conventionRepository.setConventions(
        entities.reduce(
          (dict, entity) => ({ ...dict, [entity.id as string]: entity }),
          {},
        ),
      );
    });

    it("without filters returns all applications", async () => {
      const conventions = await listConventions.execute({
        status: undefined,
        agencyId: undefined,
      });
      expect(conventions).toHaveLength(applicationCount);
    });

    it("with agency filter returns all applications of the agency", async () => {
      const conventions = await listConventions.execute({
        status: undefined,
        agencyId: agencyIds[0],
      });
      expect(conventions).toHaveLength(allConventionStatuses.length);
      conventions.forEach((entity) => {
        expect(entity.agencyId).toEqual(agencyIds[0]);
      });
    });

    it("with status filter returns all applications with a given status", async () => {
      const conventions = await listConventions.execute({
        status: allConventionStatuses[0],
        agencyId: undefined,
      });
      expect(conventions).toHaveLength(agencyIds.length);
      conventions.forEach((entity) => {
        expect(entity.status).toEqual(allConventionStatuses[0]);
      });
    });

    it("with multiple filters, applies all filters as logical AND", async () => {
      const conventions = await listConventions.execute({
        status: allConventionStatuses[0],
        agencyId: agencyIds[0],
      });
      expect(conventions).toHaveLength(1);
      expect(conventions[0].status).toEqual(allConventionStatuses[0]);
      expect(conventions[0].agencyId).toEqual(agencyIds[0]);
    });
  });
});
