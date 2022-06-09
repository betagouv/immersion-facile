import { Pool, PoolClient } from "pg";
import { AgencyDtoBuilder } from "shared/src/agency/AgencyDtoBuilder";
import { PgAgencyRepository } from "../../adapters/secondary/pg/PgAgencyRepository";
import { PgConventionRepository } from "../../adapters/secondary/pg/PgConventionRepository";
import { ConventionId } from "shared/src/convention/convention.dto";
import { getTestPgPool } from "../../_testBuilders/getTestPgPool";
import { ConventionDtoBuilder } from "shared/src/convention/ConventionDtoBuilder";

describe("PgConventionRepository", () => {
  let pool: Pool;
  let client: PoolClient;
  let conventionRepository: PgConventionRepository;

  beforeAll(async () => {
    pool = getTestPgPool();
    client = await pool.connect();
    const agencyRepository = new PgAgencyRepository(client);
    await agencyRepository.insert(AgencyDtoBuilder.create().build());
  });

  afterAll(async () => {
    client.release();
    await pool.end();
  });

  beforeEach(async () => {
    await client.query("DELETE FROM immersion_applications");
    conventionRepository = new PgConventionRepository(client);
  });

  it("Adds a new convention", async () => {
    const convention = new ConventionDtoBuilder()
      .withId("aaaaac99-9c0b-bbbb-bb6d-6bb9bd38aaaa")
      .build();
    await conventionRepository.save(convention);

    expect(await conventionRepository.getById(convention.id)).toEqual(
      convention,
    );
  });

  it("Adds a new convention with field workConditions undefined", async () => {
    const convention = new ConventionDtoBuilder()
      .withoutWorkCondition()
      .build();

    await conventionRepository.save(convention);

    expect(await conventionRepository.getById(convention.id)).toEqual(
      convention,
    );
  });

  it("Updates an already saved immersion", async () => {
    const idA: ConventionId = "aaaaac99-9c0b-aaaa-aa6d-6bb9bd38aaaa";
    const convention = new ConventionDtoBuilder().withId(idA).build();
    await conventionRepository.save(convention);

    const updatedConvention = new ConventionDtoBuilder()
      .withId(idA)
      .withStatus("VALIDATED")
      .withEmail("someUpdated@email.com")
      .withDateEnd("2021-01-20")
      .build();

    await conventionRepository.update(updatedConvention);

    expect(await conventionRepository.getById(idA)).toEqual(updatedConvention);
  });
});
