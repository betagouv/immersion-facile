import { AddressDto } from "shared/src/address/address.dto";
import { AgencyDtoBuilder } from "shared/src/agency/AgencyDtoBuilder";
import { createInMemoryUow } from "../../../adapters/primary/config/uowConfig";
import { InMemoryAgencyRepository } from "../../../adapters/secondary/InMemoryAgencyRepository";
import { InMemoryUowPerformer } from "../../../adapters/secondary/InMemoryUowPerformer";
import { ListAgenciesWithDepartmentCode } from "../../../domain/convention/useCases/ListAgenciesWithDepartmentCode";
import { expectTypeToMatchAndEqual } from "../../../_testBuilders/test.helpers";

const defaultAdress: AddressDto = {
  city: "",
  streetNumberAndAddress: "",
  postcode: "",
  departmentCode: "64",
};

const agency1 = AgencyDtoBuilder.empty()
  .withId("11111111-1111-1111-1111-111111111111")
  .withName("agency1")
  .withAddress(defaultAdress)
  .build();

const agency2 = AgencyDtoBuilder.empty()
  .withId("22222222-2222-2222-2222-222222222222")
  .withName("agency2")
  .withPosition(10, 10)
  .withAddress(defaultAdress)
  .build();

const agencyInReview = AgencyDtoBuilder.empty()
  .withId("33333333-3333-3333-3333-333333333333")
  .withName("agency3")
  .withStatus("needsReview")
  .withPosition(11, 10)
  .withAddress(defaultAdress)
  .build();

const agencyAddedFromPeReferencial = AgencyDtoBuilder.empty()
  .withId("44444444-4444-4444-4444-444444444444")
  .withName("agency4")
  .withPosition(10, 10)
  .withStatus("from-api-PE")
  .withAddress(defaultAdress)
  .build();

describe("ListAgencies", () => {
  let agencyRepository: InMemoryAgencyRepository;
  let listAgencies: ListAgenciesWithDepartmentCode;

  beforeEach(() => {
    const uow = createInMemoryUow();
    agencyRepository = uow.agencyRepository;
    listAgencies = new ListAgenciesWithDepartmentCode(
      new InMemoryUowPerformer(uow),
    );
  });

  it("returns empty list when the repository is empty", async () => {
    agencyRepository.setAgencies([]);
    const agencies = await listAgencies.execute({ departmentCode: "75" });
    expect(agencies).toEqual([]);
  });

  it("returns active stored agencies", async () => {
    agencyRepository.setAgencies([
      agency1,
      agency2,
      agencyInReview,
      agencyAddedFromPeReferencial,
    ]);

    const agencies = await listAgencies.execute({ departmentCode: "64" });
    expect(agencies).toHaveLength(3);
    expect(agencies).toEqual([
      {
        id: agency1.id,
        name: agency1.name,
      },
      {
        id: agency2.id,
        name: agency2.name,
      },
      {
        id: agencyAddedFromPeReferencial.id,
        name: agencyAddedFromPeReferencial.name,
      },
    ]);
  });

  it("filters on departmentCode", async () => {
    const agency75 = AgencyDtoBuilder.empty()
      .withAddress({
        city: "",
        streetNumberAndAddress: "",
        postcode: "",
        departmentCode: "75",
      })
      .build();

    const agency20 = AgencyDtoBuilder.empty()
      .withId("20")
      .withAddress({
        city: "",
        streetNumberAndAddress: "",
        postcode: "",
        departmentCode: "20",
      })
      .build();

    agencyRepository.setAgencies([agency75, agency20]);

    const agenciesOf75 = await listAgencies.execute({
      departmentCode: "75",
    });
    expectTypeToMatchAndEqual(agenciesOf75, [
      { id: agency75.id, name: agency75.name },
    ]);
  });

  it("returns 20 nearest agencies", async () => {
    const agencies = [];
    for (let i = 0; i < 100; i++) {
      agencies.push(
        AgencyDtoBuilder.empty()
          .withId(i.toString())
          .withName("agency " + i)
          .withPosition(20 + 0.01 * i, 20)
          .withAddress({
            city: "",
            streetNumberAndAddress: "",
            postcode: "",
            departmentCode: "75",
          })
          .build(),
      );
    }

    agencyRepository.setAgencies(agencies);

    const agenciesOf75 = await listAgencies.execute({
      departmentCode: "75",
    });
    expect(agenciesOf75).toHaveLength(20);
    expect(agenciesOf75[0].id).toBe("0");
  });
});
