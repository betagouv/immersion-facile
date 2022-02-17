import { buildTestApp } from "../../_testBuilders/buildTestApp";
import { extractImmersionApplicationsExcelRoute } from "../../shared/routes";
import { ImmersionApplicationEntityBuilder } from "../../_testBuilders/ImmersionApplicationEntityBuilder";
import { AgencyConfig } from "../../domain/immersionApplication/ports/AgencyRepository";
import * as fse from "fs-extra";
import { temporaryStoragePath } from "../../utils/filesystemUtils";

describe("/extract-demande-immersion-excel", () => {
  it("fails with 401 without authentication", async () => {
    const { request } = await buildTestApp();
    await request.get(`/${extractImmersionApplicationsExcelRoute}`).expect(401);
  });

  it("works when authenticated", async () => {
    const { request, reposAndGateways } = await buildTestApp();
    const linkedAgency: AgencyConfig = (
      await reposAndGateways.agency.getAllActive()
    )[0];
    const immersionApplicationEntity = new ImmersionApplicationEntityBuilder()
      .withAgencyId(linkedAgency.id)
      .build();

    reposAndGateways.immersionApplication.setImmersionApplications({
      [immersionApplicationEntity.id]: immersionApplicationEntity,
    });

    const result = await request
      .get(`/${extractImmersionApplicationsExcelRoute}`)
      .auth("e2e_tests", "e2e");

    expect(result.status).toBe(200);
    expect(result.headers).toMatchObject({
      "content-disposition": 'attachment; filename="exportAgencies.zip"',
      "content-type": "application/zip",
    });

    expect(fse.readdirSync(temporaryStoragePath())).toHaveLength(0);
  });
});
