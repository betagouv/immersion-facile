import { SuperTest, Test } from "supertest";
import { buildTestApp } from "../../_testBuilders/buildTestApp";
import { EstablishmentAggregateBuilder } from "../../_testBuilders/EstablishmentAggregateBuilder";
import { EstablishmentEntityV2Builder } from "../../_testBuilders/EstablishmentEntityV2Builder";
import { InMemoryUnitOfWork } from "../../adapters/primary/config/uowConfig";

describe("route to check if a form's siret already exists", () => {
  let request: SuperTest<Test>;
  let inMemoryUow: InMemoryUnitOfWork;

  beforeEach(async () => {
    ({ request, inMemoryUow } = await buildTestApp());
  });
  it("Returns false if the siret does not exist", async () => {
    await request
      .get("/form-already-exists/11111111111111")
      .expect(200, "false");
  });

  it("Returns true if the siret exists", async () => {
    await inMemoryUow.establishmentAggregateRepository.insertEstablishmentAggregates(
      [
        new EstablishmentAggregateBuilder()
          .withEstablishment(
            new EstablishmentEntityV2Builder()
              .withDataSource("form")
              .withSiret("11111111111111")
              .build(),
          )
          .build(),
      ],
    );
    await request
      .get("/form-already-exists/11111111111111")
      .expect(200, "true");
  });
});
