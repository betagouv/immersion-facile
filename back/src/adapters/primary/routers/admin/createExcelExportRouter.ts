import { Router } from "express";
import { FormSourceProvider } from "shared/src/establishmentExport/establishmentExport.dto";
import {
  exportConventionsExcelRoute,
  exportEstablismentsExcelRoute,
} from "shared/src/routes";
import { capitalize } from "shared/src/utils/string";
import { temporaryStoragePath } from "../../../../utils/filesystemUtils";
import type { AppDependencies } from "../../config/createAppDependencies";
import { sendZipResponse } from "../../helpers/sendZipResponse";

export const createExcelExportRouter = (deps: AppDependencies) => {
  const excelExportRouter = Router({ mergeParams: true });

  excelExportRouter
    .route(`/${exportConventionsExcelRoute}`)
    .get(async (req, res) =>
      sendZipResponse(req, res, async () => {
        const archivePath = await temporaryStoragePath("exportAgencies.zip");
        await deps.useCases.exportConventionsAsExcelArchive.execute(
          archivePath,
        );
        return archivePath;
      }),
    );

  excelExportRouter
    .route(`/${exportEstablismentsExcelRoute}`)
    .get(async (req, res) =>
      sendZipResponse(req, res, async () => {
        const groupKey =
          req.query.groupKey === "region" ? "region" : "department";
        const aggregateProfession = req.query.aggregateProfession === "true";

        const sourceProvider = [
          "immersion-facile",
          "cci",
          "cma",
          "lesentreprises-sengagent",
          "unJeuneUneSolution",
        ].includes(req.query.sourceProvider as FormSourceProvider)
          ? (req.query.sourceProvider as FormSourceProvider)
          : "all";

        const archivePath = await temporaryStoragePath(
          `export${capitalize(sourceProvider)}EstablishmentsBy${capitalize(
            groupKey,
          )}${aggregateProfession ? "AggregatedProfessions" : ""}.zip`,
        );

        await deps.useCases.exportEstablishmentsAsExcelArchive.execute({
          archivePath,
          groupKey,
          aggregateProfession,
          sourceProvider,
        });

        return archivePath;
      }),
    );

  return excelExportRouter;
};
